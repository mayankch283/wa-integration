import json
import os
import httpx
from fastapi import FastAPI, HTTPException, Depends, Body, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, validator
from pydantic_settings import BaseSettings
from typing import Dict, Any, Optional, List
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

class Settings(BaseSettings):
    facebook_api_token: str = os.getenv("FACEBOOK_API_TOKEN")
    facebook_phone_number_id: str = os.getenv("FACEBOOK_PHONE_NUMBER_ID")
    webhook_verify_token: str = os.getenv("WEBHOOK_VERIFY_TOKEN")
    facebook_app_id: str = os.getenv("FACEBOOK_APP_ID")
    facebook_api_version: str = "v22.0"
    supabase_url: str = os.getenv("SUPABASE_URL")
    supabase_key: str = os.getenv("SUPABASE_KEY")


    class Config:
        env_file = '.env'

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

class MessageStore:
    def __init__(self, settings: Settings):
        self.supabase: Client = create_client(settings.supabase_url, settings.supabase_key)
    
    def add_message(self, message_data):
        try:
            timestamp = message_data.get("timestamp")
            if timestamp:
                timestamp = int(timestamp) if isinstance(timestamp, str) else timestamp
                from datetime import datetime
                formatted_timestamp = datetime.fromtimestamp(timestamp).isoformat()
            else:
                formatted_timestamp = datetime.utcnow().isoformat()

            structured_data = {
                "message_id": message_data.get("id"),
                "from_number": message_data.get("from"),
                "timestamp": formatted_timestamp,
                "message_type": message_data.get("type"),
                "message_content": json.dumps(message_data),
                "contact_info": json.dumps(message_data.get("contact_info", {}))
            }
            
            print(f"Inserting message with timestamp: {formatted_timestamp}")
            return self.supabase.table("messages").insert(structured_data).execute()
        
        except Exception as e:
            print(f"Error adding message: {e}")
            raise

    def get_all_messages(self):
        return self.supabase.table("messages").select("*").execute().data

app = FastAPI(
    title="WhatsApp Sender API",
    description="An API to send WhatsApp messages via Facebook Graph API",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_settings() -> Settings:
    return Settings()

message_store = MessageStore(get_settings())

@app.get("/")
async def root():
    return {"message": "WhatsApp Sender API is running"}

@app.get("/webhook")
async def verify_webhook(request: Request, settings: Settings = Depends(get_settings)):
    params = dict(request.query_params)
    mode = params.get("hub.mode")
    token = params.get("hub.verify_token")
    challenge = params.get("hub.challenge")
    
    if mode and token:
        if mode == "subscribe" and token == settings.webhook_verify_token:
            print("WEBHOOK_VERIFIED")
            return int(challenge) if challenge else "OK"
        else:
            raise HTTPException(status_code=403, detail="Verification failed")
    
    return {"message": "No verification parameters found"}

@app.post("/webhook")
async def receive_webhook(request: Request):
    body = await request.json()
    print(f"Received webhook: {json.dumps(body, indent=2)}")
    
    # process incoming messages
    if body.get("object") == "whatsapp_business_account":
        for entry in body.get("entry", []):
            for change in entry.get("changes", []):
                if change.get("field") == "messages":
                    value = change.get("value", {})
                    
                    if "messages" in value:
                        for message in value["messages"]:
                            if "contacts" in value:
                                for contact in value["contacts"]:
                                    message["contact_info"] = contact
                            
                            # store the message
                            message_store.add_message(message)
                            print(f"Stored message: {message}")
    
    return {"status": "success"}

@app.get("/messages")
async def get_messages():
    return {"messages": message_store.get_all_messages()}

@app.post("/send-whatsapp-template")
async def send_whatsapp_message(
    payload: WhatsAppTemplateRequest,
    settings: Settings = Depends(get_settings)
):
    api_url = f"https://graph.facebook.com/{settings.facebook_api_version}/{settings.facebook_phone_number_id}/messages"

    headers = {
        "Authorization": f"Bearer {settings.facebook_api_token}",
        "Content-Type": "application/json",
    }

    facebook_payload = {
        "messaging_product": "whatsapp",
        "to": payload.to,
        "type": "template",
        "template": {
            "name": payload.template_name,
            "language": {"code": payload.language_code},
            "components": payload.components
        }
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                api_url,
                headers=headers,
                json=facebook_payload,
                timeout=10.0 
            )
            
            response.raise_for_status()
            return response.json()
            
        except httpx.TimeoutException:
            raise HTTPException(
                status_code=504, detail="Request to Facebook API timed out"
            )
        except httpx.RequestError as exc:
            raise HTTPException(
                status_code=503, detail=f"Error contacting Facebook API: {exc}"
            )
        except httpx.HTTPStatusError as exc:
            print(f"Facebook API Error Response: {exc.response.text}")
            raise HTTPException(
                status_code=exc.response.status_code, 
                detail=f"Facebook API Error: {exc.response.json()}", 
            )
        except Exception as e:
            print(f"An unexpected error occurred: {e}")
            raise HTTPException(
                status_code=500, detail="An internal server error occurred."
                
            )

@app.get("/templates")
async def get_templates(settings: Settings = Depends(get_settings)):
    api_url = f"https://graph.facebook.com/{settings.facebook_api_version}/{settings.facebook_app_id}/message_templates"
    
    headers = {
        "Authorization": f"Bearer {settings.facebook_api_token}",
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                api_url,
                headers=headers,
                timeout=10.0
            )
            
            response.raise_for_status()
            templates_data = response.json()
            
            templates = []
            for template in templates_data.get('data', []):
                templates.append({
                    'id': template.get('id'),
                    'name': template.get('name'),
                    'language': template.get('language'),
                    'components': template.get('components', []),
                    'status': template.get('status'),
                    'category': template.get('category')
                })
            
            return {"templates": templates}
            
        except httpx.TimeoutException:
            raise HTTPException(
                status_code=504, detail="Request to Facebook API timed out"
            )
        except httpx.RequestError as exc:
            raise HTTPException(
                status_code=503, detail=f"Error contacting Facebook API: {exc}"
            )
        except httpx.HTTPStatusError as exc:
            print(f"Facebook API Error Response: {exc.response.text}")
            raise HTTPException(
                status_code=exc.response.status_code, 
                detail=f"Facebook API Error: {exc.response.json()}"
            )
        except Exception as e:
            print(f"An unexpected error occurred: {e}")
            raise HTTPException(
                status_code=500, detail="An internal server error occurred."
            )