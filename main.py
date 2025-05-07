import json
import os
import httpx
from fastapi import FastAPI, HTTPException, Depends, Body, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from pydantic_settings import BaseSettings
from typing import Dict, Any, Optional
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    facebook_api_token: str = os.getenv("FACEBOOK_API_TOKEN")
    facebook_phone_number_id: str = os.getenv("FACEBOOK_PHONE_NUMBER_ID")
    webhook_verify_token: str = os.getenv("WEBHOOK_VERIFY_TOKEN")
    facebook_api_version: str = "v22.0"


    class Config:
        env_file = '.env'

class WhatsAppTemplateRequest(BaseModel):
    to: str = Field(..., pattern=r"^\d+$", description="Recipient phone number (digits only)")
    template_name: str = "hello_world"
    language_code: str = "en_US"
    
class MessageStore:
    def __init__(self):
        self.messages = []
    
    def add_message(self, message_data):
        self.messages.append(message_data)
    
    def get_all_messages(self):
        return self.messages

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

message_store = MessageStore()

def get_settings() -> Settings:
    return Settings()

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
        },
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
    api_url = f"https://graph.facebook.com/{settings.facebook_api_version}/{settings.facebook_phone_number_id}/message_templates"
    
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