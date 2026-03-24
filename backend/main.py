import os
import random
import json
import httpx
import uuid
from datetime import datetime

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

# ✅ Gemini
import google.generativeai as genai

from models import TTSRequest, RAGQueryRequest, AgentFillRequest, ChatFollowUpRequest

# 🔹 Load env
load_dotenv()

# 🔹 Env variables
SARVAM_API_KEY = os.getenv("SARVAM_API_KEY")
MONGO_URL = os.getenv("MONGODB_URL")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_FROM_NUMBER = os.getenv("TWILIO_FROM_NUMBER")

if not SARVAM_API_KEY:
    raise ValueError("Missing SARVAM_API_KEY")

if not MONGO_URL:
    raise ValueError("Missing MONGODB_URL")

if not GROQ_API_KEY:
    raise ValueError("Missing GROQ_API_KEY")

if not GEMINI_API_KEY:
    raise ValueError("Missing GEMINI_API_KEY")

# 🔹 Init services
genai.configure(api_key=GEMINI_API_KEY)
app = FastAPI()

# 🔹 MongoDB
mongo_client = AsyncIOMotorClient(MONGO_URL)
db = mongo_client["chakra"]

cases_collection = db["cases"]
legal_sections_collection = db["legal_chunks"]

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
# 📊 Recent Case Topics
# =========================
@app.get("/cases/recent")
async def get_recent_cases(limit: int = 8):
    """Returns the most recent cases for the dashboard topics widget."""
    try:
        cursor = cases_collection.find(
            {},
            {
                "_id": 0,
                "user_text": 1,
                "matched_sections": 1,
                "status": 1,
                "created_at": 1,
            }
        ).sort("created_at", -1).limit(limit)

        cases = await cursor.to_list(length=limit)

        result = []
        for c in cases:
            result.append({
                "topic": c.get("user_text", "Unknown")[:80],
                "section": (c.get("matched_sections") or ["—"])[0],
                "status": c.get("status", "active_strategy"),
                "created_at": c["created_at"].isoformat() if c.get("created_at") else None,
            })

        return {"cases": result, "total": len(result)}
    except Exception as e:
        print(f"Error fetching recent cases: {e}")
        return {"cases": [], "total": 0}


# =========================
# ⚖️ RAG Query (Groq Powered)
# =========================
@app.post("/rag/query")
async def rag_query(req: RAGQueryRequest):

    # 🔹 Extract deep legal intent over simple translation via Gemini
    intent_prompt = f"""
Analyze the following user text (which may be in any Indian language or English).
Extract the core legal intent, situation, or problem the user is facing in clear, formal English.
Focus entirely on the specific legal issue, violation, or question to optimize it for a database search algorithm.
Return ONLY the extracted English intent. No conversational filler or explanations.

Text: {req.text}
"""
    
    try:
        gemini_model = genai.GenerativeModel('gemini-2.5-flash')
        intent_response = await gemini_model.generate_content_async(intent_prompt)
        english_intent = intent_response.text.strip()
        print(f"🌍 Extracted Intent via Gemini: '{req.text}' -> '{english_intent}'")
    except Exception as e:
        print(f"⚠️ Gemini Free-Tier Quota Exceeded. Falling back to Groq Llama-3 Native Intent Extraction: {e}")
        fallback_response = groq_client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are a direct translation engine. You return nothing but the translated text."},
                {"role": "user", "content": intent_prompt}
            ],
            model="llama-3.3-70b-versatile"
        )
        english_intent = fallback_response.choices[0].message.content.strip()
        print(f"🌍 Extracted Intent via Groq Fallback: '{req.text}' -> '{english_intent}'")

    # 🔹 Generate embedding from the ENGLISH intent for high accuracy local search
    embedding = model.encode(english_intent).tolist()

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

    # 🔹 Dual-Agent Pipeline
    # 1. Groq summarizes the law into a tactical evasion defense
    all_context = "\n\n".join([f"{s.get('section_title')}: {s.get('section_text')}" for s in retrieved_sections])
    
    groq_defense_prompt = f"""
You are an elite legal defense tactician. Relying strictly on the following Indian Law sections:
{all_context}

User's Incident: {english_intent}

Consolidate a highly strategic defense summary highlighting EXACTLY how the person can use these specific laws to legally EVADE fines or punishment. Focus on technicalities, procedural loopholes, and direct rights. 
Return ONLY the tactical English summary.
"""
    groq_res = groq_client.chat.completions.create(
        messages=[{"role": "user", "content": groq_defense_prompt}],
        model="llama-3.3-70b-versatile"
    )
    defense_summary = groq_res.choices[0].message.content.strip()

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

    # Honor explicit selection; if "auto" let Gemini detect from the user's text
    if req.language_code in lang_map:
        human_lang = lang_map[req.language_code]
        lang_instruction = f"Respond ONLY in {human_lang}. Absolutely NO other language."
    else:
        human_lang = "auto"
        lang_instruction = (
            f"The user typed: '{req.text}'. "
            "Detect the language or dialect they are using (e.g. Tamil, Tanglish, Hindi, Hinglish, English, Telugu, etc.) "
            "and reply in that EXACT same language and style. "
            "If they wrote in Tanglish (Tamil in Latin script), reply in Tanglish. "
            "If they wrote in Tamil script, reply in Tamil script. Match their language exactly."
        )
        print(f"🌐 Language set to auto-detect from user input")

    # 2. Gemini acts as a humanized decision agent, returning structured JSON
    gemini_prompt = f"""You are a knowledgeable, caring legal friend helping someone navigate a tough situation in India. You know Indian law well and want to genuinely help.

User situation: {english_intent}

Relevant law: {defense_summary}

Your job: Give a clear, warm, helpful reply — like a trusted friend who happens to know the law. 
Explain what they should actually do, step by step if needed. Be honest about whether their situation is serious or manageable.

LANGUAGE RULE: {lang_instruction}

RULES:
- Warm, calm, encouraging tone — never rude or dismissive
- Include actual facts and procedures from the law — don't be vague
- Keep it under 120 words — clear and focused, not overwhelming
- Use natural sentences, avoid bullet lists or headers
- If you need more information, ask 1-2 specific questions in a friendly way
- If the situation is fine, reassure them clearly
- If they need to take action, tell them exactly what to do

ESCALATION: If this genuinely requires action on a government portal OR a police call, add ONE escalation. Pick the MOST RELEVANT option from this list based on the user's situation:

CALLS:
- Police emergency: type="call", label="Call Police", target="+919952140455"
- Traffic police: type="call", label="Call Traffic Police", target="+919952140455"

PORTALS — pick the ONE most relevant:
- Traffic challan dispute / contest a challan: type="portal", label="Contest Challan on Virtual Court", target="https://vcourts.gov.in/"
- Pay traffic challan online: type="portal", label="Pay Challan on Parivahan", target="https://echallan.parivahan.gov.in/"
- Driving licence services (renewal, duplicate, issue): type="portal", label="Driving Licence Services", target="https://sarathi.parivahan.gov.in/"
- Vehicle registration / RC related / ownership transfer: type="portal", label="Vehicle Registration – Parivahan", target="https://vahan.parivahan.gov.in/"
- General Parivahan / transport services: type="portal", label="Parivahan Portal", target="https://parivahan.gov.in/parivahan/"
- Consumer complaint (product defect, service fraud, overcharging): type="portal", label="File Consumer Complaint", target="https://consumerhelpline.gov.in/"
- Online consumer forum / NCDRC: type="portal", label="Consumer Forum – eDaakhil", target="https://edaakhil.nic.in/"
- File an FIR online / cybercrime complaint: type="portal", label="File FIR / Cybercrime Complaint", target="https://www.ncrp.in/"
- RTI – Right to Information request: type="portal", label="File RTI Online", target="https://rtionline.gov.in/"
- eCourts – check case status / hearings: type="portal", label="Check Case Status – eCourts", target="https://services.ecourts.gov.in/"
- Free legal aid / NALSA: type="portal", label="Get Free Legal Aid – NALSA", target="https://nalsa.gov.in/"
- Labour dispute / PF / ESI: type="portal", label="Labour Grievance Portal", target="https://grievance.epfindia.gov.in/"
- Income tax / tax related: type="portal", label="Income Tax Portal", target="https://www.incometax.gov.in/"
- Property / land records dispute: type="portal", label="Bhulekh Land Records", target="https://bhulekh.mahabhumi.gov.in/"
- Passport / visa services: type="portal", label="Passport Seva Portal", target="https://www.passportindia.gov.in/"

Only escalate if genuinely necessary. Choose ONLY one escalation option.

Return ONLY valid JSON, nothing else:
{{
  "message": "<your warm, clear, factual reply>",
  "escalation": null
}}

OR if escalation needed:
{{
  "message": "<your warm, clear, factual reply>",
  "escalation": {{
    "type": "call" or "portal",
    "label": "<button label>",
    "target": "<phone number or URL>"
  }}
}}"""
    try:
        gemini_model = genai.GenerativeModel('gemini-2.5-flash')
        raw = await gemini_model.generate_content_async(gemini_prompt)
        raw_text = raw.text.strip()
    except Exception as e:
        print(f"⚠️ Gemini Quota Exceeded. Falling back to Groq: {e}")
        fb = groq_client.chat.completions.create(
            messages=[{"role": "user", "content": gemini_prompt}],
            model="llama-3.3-70b-versatile"
        )
        raw_text = fb.choices[0].message.content.strip()

    # Parse the JSON response
    ai_text = raw_text
    escalation = None
    try:
        # Strip markdown code fences if present
        clean = raw_text.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
        parsed = json.loads(clean)
        ai_text = parsed.get("message", raw_text)
        escalation = parsed.get("escalation", None)
    except Exception:
        print(f"⚠️ Could not parse Gemini JSON, using raw text.")

    # 🔹 Save Case Log seamlessly
    try:
        top_result = retrieved_sections[0] if retrieved_sections else {}
        matched_title = top_result.get("section_title", "Unknown Section")
        
        case_doc = {
            "user_id": "demo-user-001",
            "input_story": english_intent,
            "language_code": human_lang,
            "matched_sections": [matched_title],
            "defence_steps": [ai_text],
            "reference_id": f"REF-PARI-{str(uuid.uuid4())[:6].upper()}",
            "status": "active_strategy",
            "created_at": datetime.utcnow()
        }
        await cases_collection.insert_one(case_doc)
    except Exception as dberr:
        print(f"Error logging case to DB: {dberr}")
        matched_title = "Unknown Section"

    return {
        "matched_section": matched_title,
        "explanation": ai_text,
        "escalation": escalation
    }


# =========================
# 💬 Ongoing Chat Strategy
# =========================
@app.post("/chat/followup")
async def chat_followup(req: ChatFollowUpRequest):
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

    # Honor explicit selection; for "auto" instruct the model to detect from user text
    if req.language_code in lang_map:
        human_lang = lang_map[req.language_code]
        lang_instruction = f"You MUST respond entirely in {human_lang}. Absolutely NO other language."
    else:
        # Find last user message to give model context for detection
        last_user_text = next((m.content for m in reversed(req.messages) if m.role == "user"), "")
        human_lang = "auto"
        lang_instruction = (
            f"The user's last message was: '{last_user_text}'. "
            "Detect what language or dialect they are using (Tamil, Tanglish, Hindi, Hinglish, English, Telugu, etc.) "
            "and reply in that EXACT same language and style. Match their language exactly."
        )
        print(f"🌐 Chat followup: language set to auto-detect")

    formatted_msgs = [
        {
            "role": "system",
            "content": (
                f"You are a knowledgeable, warm Indian legal assistant helping someone deal with a legal issue or traffic case. "
                f"Be supportive and clear — like a helpful friend who knows the law, not an aggressive debater. "
                f"Give factual, procedurally correct advice. Explain what they should actually do. "
                f"Keep responses conversational and focused — around 3-4 sentences max, no walls of text. "
                f"{lang_instruction}"
            )
        }
    ]

    for m in req.messages:
        formatted_msgs.append({"role": m.role, "content": m.content})

    response = groq_client.chat.completions.create(
        messages=formatted_msgs,
        model="llama-3.3-70b-versatile"
    )

    return {"reply": response.choices[0].message.content}


# =========================
# 🚨 Emergency Helpline Call via Twilio
# =========================
@app.post("/emergency/call")
async def emergency_call(data: dict):
    """
    Places a Twilio call to the user's phone.
    When they answer, bridges them to the target helpline number.
    """
    user_phone = data.get("user_phone")  # e.g. "+919876543210"
    helpline = data.get("helpline", "+919952140455")  # dummy emergency number
    helpline_name = data.get("helpline_name", "Traffic Police Helpline")

    if not user_phone:
        raise HTTPException(status_code=400, detail="user_phone is required")

    if not TWILIO_ACCOUNT_SID or not TWILIO_AUTH_TOKEN or not TWILIO_FROM_NUMBER:
        raise HTTPException(
            status_code=503,
            detail="Twilio credentials not configured. Add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER to .env"
        )

    try:
        from twilio.rest import Client as TwilioClient
        twilio = TwilioClient(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

        # TwiML: greet the user then connect to helpline
        twiml = f"""
        <Response>
            <Say voice="woman" language="en-IN">
                This is Chakravyuha Legal Assistant. We are now connecting you to {helpline_name}. Please hold.
            </Say>
            <Dial callerId="{TWILIO_FROM_NUMBER}">
                <Number>{helpline}</Number>
            </Dial>
        </Response>
        """.strip()

        call = twilio.calls.create(
            to=user_phone,
            from_=TWILIO_FROM_NUMBER,
            twiml=twiml
        )

        print(f"📞 Emergency call placed: SID={call.sid} to={user_phone} helpline={helpline}")
        return {"success": True, "call_sid": call.sid, "message": f"Calling {user_phone}. Connecting to {helpline_name}."}

    except Exception as e:
        print(f"❌ Twilio call failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


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