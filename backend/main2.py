import os
import random
import json
import httpx

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# ❌ remove OpenAI (not needed for rag)
# from openai import AsyncOpenAI

# ✅ MongoDB (async)
from motor.motor_asyncio import AsyncIOMotorClient

# ✅ Free embeddings
from sentence_transformers import SentenceTransformer

# ✅ Groq
from groq import Groq

from models import TTSRequest, RAGQueryRequest, AgentFillRequest

# 🔹 Load env
load_dotenv()

# 🔹 Env variables
SARVAM_API_KEY = os.getenv("SARVAM_API_KEY")
MONGO_URL = os.getenv("MONGODB_URL")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not SARVAM_API_KEY:
    raise ValueError("Missing SARVAM_API_KEY")

if not MONGO_URL:
    raise ValueError("Missing MONGODB_URL")

if not GROQ_API_KEY:
    raise ValueError("Missing GROQ_API_KEY")

# 🔹 Init services
app = FastAPI()

# 🔹 MongoDB
mongo_client = AsyncIOMotorClient(MONGO_URL)
db = mongo_client["chakra"]

cases_collection = db["cases"]
legal_sections_collection = db["code"]

# 🔹 Load embedding model ONCE
model = SentenceTransformer('all-MiniLM-L6-v2')

# 🔹 Groq client
groq_client = Groq(api_key=GROQ_API_KEY)

# 🔹 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# 🎤 Speech to Text with Auto Language Detection
# =========================
@app.post("/stt")
async def stt(file: UploadFile = File(...), language_code: str = Form(None)):
    """
    Speech to Text with auto language & dialect detection.
    
    - If language_code provided: use it
    - If not: auto-detect via Sarvam
    
    Returns: transcript, detected_language_code, dialect (if available)
    """
    url = "https://api.sarvam.ai/speech-to-text"
    headers = {"api-subscription-key": SARVAM_API_KEY}

    file_content = await file.read()
    # The Sarvam API gateway has a bug parsing pure 'data' dictionaries from httpx resulting in boundary UUIDs leaking into the field value. 
    # We pass strings as tuples inside 'files' instead so they format cleanly as multipart text strings.
    files = {
        "model": (None, "saarika:v2.5"),
        "language_code": (None, language_code or "unknown"),
        "file": (file.filename, file_content, file.content_type)
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(url, headers=headers, files=files, timeout=60.0)

    if response.status_code != 200:
        # DO NOT throw 400 exception directly. Return the error string to the UI so we can see why Sarvam rejected it.
        error_msg = response.text
        print(f"❌ SARVAM API ERROR [{response.status_code}]: {error_msg}")
        return {
            "transcript": f"API Error: {error_msg}",
            "language_code": "error",
            "dialect": "",
            "confidence": 0
        }

    result = response.json()
    
    # Extract detected language and dialect from Sarvam response
    detected_language = result.get("language_code", language_code or "unknown")
    dialect = result.get("dialect", "")  # Sarvam may return dialect info
    
    return {
        "transcript": result.get("transcript", ""),
        "language_code": detected_language,
        "dialect": dialect,
        "confidence": result.get("confidence", None)  # Sarvam may include confidence score
    }


# =========================
# 🔊 Text to Speech
# =========================
@app.post("/tts")
async def tts(req: TTSRequest):
    url = "https://api.sarvam.ai/text-to-speech"
    headers = {
        "api-subscription-key": SARVAM_API_KEY,
        "Content-Type": "application/json"
    }

    # Enforce safe language code default
    lang = req.language_code
    valid_langs = ["hi-IN", "bn-IN", "kn-IN", "ml-IN", "mr-IN", "od-IN", "pa-IN", "ta-IN", "te-IN", "gu-IN", "en-IN"]
    if lang not in valid_langs:
        lang = "hi-IN"

    # Bulbul v2 API max character limit is typical 500 chars per payload
    safe_text = req.text[:499]

    payload = {
        "inputs": [safe_text],
        "target_language_code": lang,
        "speaker": "anushka",
        "model": "bulbul:v2"
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(url, headers=headers, json=payload, timeout=60.0)

    if response.status_code != 200:
        print(f"❌ SARVAM TTS ERROR [{response.status_code}]: {response.text}")
        raise HTTPException(status_code=response.status_code, detail=response.text)

    result = response.json()
    audios = result.get("audios", [])

    if not audios:
        raise HTTPException(status_code=500, detail="No audio returned")

    return {"audio_base64": audios[0]}


# =========================
# ⚖️ RAG Query (Groq Powered)
# =========================
@app.post("/rag/query")
async def rag_query(req: RAGQueryRequest):

    # 🔹 Translate the raw text to English via Groq
    translation_prompt = (
        "Translate the following text to English accurately. "
        "Return ONLY the English translation. No explanations or extra text."
    )
    translation_response = groq_client.chat.completions.create(
        messages=[
            {"role": "system", "content": translation_prompt},
            {"role": "user", "content": req.text}
        ],
        model="llama-3.1-8b-instant"
    )
    
    english_text = translation_response.choices[0].message.content.strip()
    print(f"🌍 Translated via Groq '{req.text}' -> '{english_text}'")

    # 🔹 Generate embedding from the ENGLISH text for high accuracy local search
    embedding = model.encode(english_text).tolist()

    # 🔹 Vector search
    pipeline = [
        {
            "$vectorSearch": {
                "index": "legal_vector_index",
                "path": "embedding",
                "queryVector": embedding,
                "numCandidates": 50,
                "limit": 5
            }
        },
        {
            "$project": {
                "_id": 0,
                "section_title": 1,
                "section_text": "$text",
                "act": "$code"
            }
        }
    ]

    cursor = legal_sections_collection.aggregate(pipeline)
    retrieved_sections = await cursor.to_list(length=5)

    if not retrieved_sections:
        return {
            "matched_section": "No relevant law found",
            "explanation": "Try rephrasing your query"
        }

    top_result = retrieved_sections[0]

    lang_map = {
        "hi-IN": "Hindi",
        "bn-IN": "Bengali",
        "kn-IN": "Kannada",
        "ml-IN": "Malayalam",
        "mr-IN": "Marathi",
        "od-IN": "Odia",
        "pa-IN": "Punjabi",
        "ta-IN": "Tamil",
        "te-IN": "Telugu",
        "gu-IN": "Gujarati",
        "en-IN": "English"
    }
    human_lang = lang_map.get(req.language_code, req.language_code)

    # 🔹 Prompt for AI
    prompt = f"""
You are an expert lawyer advising a client entirely in {human_lang}.
Explain the legal situation below natively in {human_lang} script. Absolutely NO English words or Romanized/transliterated text.

Law Context: {top_result.get("section_title")} - {top_result.get("section_text")}
User Situation: {english_text}

Provide exactly two parts cleanly in {human_lang}:
1. A short, simple explanation of the law.
2. 3 simple, actionable steps the user should take.

Format as plain sentences separated by newlines. Do not use Markdown, bolding, or English list artifacts.
"""

    # 🔹 Groq call
    response = groq_client.chat.completions.create(
        messages=[
            {"role": "system", "content": f"You are a helpful legal assistant that strictly replies in {human_lang} script only."},
            {"role": "user", "content": prompt}
        ],
        model="llama-3.3-70b-versatile"
    )

    ai_text = response.choices[0].message.content

    return {
        "matched_section": top_result.get("section_title", ""),
        "explanation": ai_text
    }


# =========================
# 🤖 Agent Fill (still OpenAI optional)
# =========================
@app.post("/agent/fill")
async def agent_fill(req: AgentFillRequest):

    prompt = f"""
Fill the Parivahan dispute form using:
{req.user_details.model_dump_json()}
for case {req.case_id}
"""

    # ⚠️ Replace later if needed
    return {
        "reference_id": f"REF-PARI-{random.randint(1000, 9999)}",
        "status": "submitted"
    }


# =========================
# 📂 Get Cases
# =========================
@app.get("/cases/{user_id}")
async def get_cases(user_id: str):
    cursor = cases_collection.find({"user_id": user_id})
    cases = await cursor.to_list(length=100)

    for c in cases:
        c["_id"] = str(c["_id"])

    return cases