from typing import Any, List, Optional
from pydantic_settings import BaseSettings
from pydantic import BaseModel, Field, validator

class WhatsAppTemplateParameter(BaseModel):
    type: str = "text"
    text: str

    class Config:
        json_encoders = {
            Any: lambda v: v.__dict__ if hasattr(v, '__dict__') else str(v)
        }

class WhatsAppTemplateComponent(BaseModel):
    type: str  
    parameters: List[WhatsAppTemplateParameter]

    class Config:
        json_encoders = {
            Any: lambda v: v.__dict__ if hasattr(v, '__dict__') else str(v)
        }

class WhatsAppTemplateRequest(BaseModel):
    to: str = Field(..., pattern=r"^\d+$", description="Recipient phone number (digits only)")
    template_name: str
    language_code: str
    components: List[WhatsAppTemplateComponent]

    class Config:
        json_encoders = {
            Any: lambda v: v.__dict__ if hasattr(v, '__dict__') else str(v)
        }
        
    @validator('components')
    def validate_components(cls, v):
        return [comp.dict() for comp in v]

class TemplateExample(BaseModel):
    header_text: Optional[List[str]] = None
    body_text: Optional[List[List[str]]] = None

class TemplateButton(BaseModel):
    type: str
    text: str

class TemplateComponent(BaseModel):
    type: str
    format: Optional[str] = None
    text: Optional[str] = None
    example: Optional[TemplateExample] = None
    buttons: Optional[List[TemplateButton]] = None

class TemplateCreateRequest(BaseModel):
    name: str
    language: str
    category: str
    components: List[TemplateComponent]

