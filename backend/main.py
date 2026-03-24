import os
import random
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import httpx
from openai import AsyncOpenAI
import json

from database import cases_collection, legal_sections_collection
from models import TTSRequest, RAGQueryRequest, AgentFillRequest

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SARVAM_API_KEY = os.getenv("SARVAM_API_KEY")
openai_client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

@app.post("/stt")
async def stt(file: UploadFile = File(...), language_code: str = Form("ta-IN")):
    url = "https://api.sarvam.ai/speech-to-text"
    headers = {"api-subscription-key": SARVAM_API_KEY}
    
    file_content = await file.read()
    files = {"file": (file.filename, file_content, file.content_type)}
    data = {"model": "saarika:v2", "language_code": language_code}
    
    async with httpx.AsyncClient() as client:
        response = await client.post(url, headers=headers, data=data, files=files, timeout=60.0)
        
    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=response.text)
        
    result = response.json()
    return {"transcript": result.get("transcript", ""), "language_code": language_code}


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
        response = await client.post(url, headers=headers, json=payload, timeout=60.0)
        
    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=response.text)
        
    result = response.json()
    audios = result.get("audios", [])
    if not audios:
        raise HTTPException(status_code=500, detail="No audio returned from Sarvam")
        
    return {"audio_base64": audios[0]}


@app.post("/rag/query")
async def rag_query(req: RAGQueryRequest):
    # Call OpenAI Embeddings
    embed_response = await openai_client.embeddings.create(
        input=req.text,
        model="text-embedding-3-small"
    )
    embedding = embed_response.data[0].embedding
    
    # Vector Search in MongoDB
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
                "section_text": 1,
                "act": 1
            }
        }
    ]
    
    cursor = legal_sections_collection.aggregate(pipeline)
    retrieved_sections = await cursor.to_list(length=5)
    
    context = "\n".join([f"{doc.get('act')} - {doc.get('section_title')}: {doc.get('section_text')}" for doc in retrieved_sections])
    
    system_prompt = (
        "You are an Indian legal assistant. Using only the provided legal sections, identify the matched law section and provide 3-5 plain language defence steps. Always respond in the same language as the user query. "
        "Return your response strictly in the following JSON format: "
        "{ \"matched_section\": \"Title of aligned section\", \"defence_steps\": [\"Step 1\", \"Step 2\", \"Step 3\"] }"
        f"\n\nLegal context:\n{context}"
    )
    
    prompts = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": req.text}
    ]
    
    chat_response = await openai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=prompts,
        temperature=0.2,
        response_format={"type": "json_object"}
    )
    
    content = chat_response.choices[0].message.content
    try:
        data = json.loads(content)
        return {"matched_section": data.get("matched_section", ""), "defence_steps": data.get("defence_steps", [])}
    except Exception as e:
        return {"matched_section": "Parse Error", "defence_steps": [str(e), content]}


@app.post("/agent/fill")
async def agent_fill(req: AgentFillRequest):
    prompt = f"Fill the Parivahan dispute form fields using these user details: {req.user_details.model_dump_json()} for case ID {req.case_id}. Keep it precise."
    
    # Normally we do an LLM structured completion here
    response = await openai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}]
    )
    
    ref_id = f"REF-PARI-{random.randint(1000, 9999)}"
    
    await cases_collection.insert_one({
        "case_id": req.case_id,
        "user_id": "demo-user-001",
        "reference_id": ref_id,
        "status": "submitted",
        "form_data": response.choices[0].message.content
    })
    
    return {"reference_id": ref_id, "status": "submitted"}


@app.get("/cases/{user_id}")
async def get_cases(user_id: str):
    cursor = cases_collection.find({"user_id": user_id})
    cases = await cursor.to_list(length=100)
    for c in cases:
        c["_id"] = str(c["_id"])
    return cases
