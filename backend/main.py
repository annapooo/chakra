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
    files = {"file": (file.filename, file_content, file.content_type)}
    
    # Build request data
    data = {"model": "saarika:v2"}
    
    # If language_code provided, use it; otherwise let Sarvam auto-detect
    if language_code:
        data["language_code"] = language_code
    else:
        # Empty language_code triggers auto-detection in Sarvam API
        data["language_code"] = ""

    async with httpx.AsyncClient() as client:
        response = await client.post(url, headers=headers, data=data, files=files, timeout=60.0)

    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=response.text)

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

    payload = {
        "inputs": [req.text],
        "target_language_code": req.language_code,
        "speaker": "meera",
        "model": "bulbul:v2"
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(url, headers=headers, json=payload)

    if response.status_code != 200:
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

    # 🔹 Generate embedding
    embedding = model.encode(req.text).tolist()

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

    # 🔹 Prompt for AI
    prompt = f"""
Explain this legal situation in very simple language.

Section: {top_result.get("section_title")}
Law Text: {top_result.get("section_text")}
User Query: {req.text}

Give:
1. What this law means
2. What the user should do (3-4 steps)

Use simple words. Avoid legal jargon.
Keep it short.
"""

    # 🔹 Groq call
    response = groq_client.chat.completions.create(
        messages=[
            {"role": "system", "content": "Explain legal concepts in very simple language."},
            {"role": "user", "content": prompt}
        ],
        model="llama-3.1-8b-instant"
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