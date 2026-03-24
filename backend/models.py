from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional

class CaseLog(BaseModel):
    user_id: str
    input_story: str
    language_code: str
    matched_sections: List[str]
    defence_steps: List[str]
    reference_id: str
    status: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class LegalSection(BaseModel):
    section_title: str
    section_text: str
    act: str
    jurisdiction: str
    embedding: List[float]

class TTSRequest(BaseModel):
    text: str
    language_code: str = "ta-IN"

class RAGQueryRequest(BaseModel):
    text: str
    language_code: str = "ta-IN"

class UserDetails(BaseModel):
    name: str
    licence_number: str
    challan_number: str

class AgentFillRequest(BaseModel):
    case_id: str
    user_details: UserDetails

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatFollowUpRequest(BaseModel):
    language_code: str = "ta-IN"
    messages: List[ChatMessage]
