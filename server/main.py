import json
import os
import httpx
from fastapi import FastAPI, HTTPException, Depends, Request, Security
from fastapi.middleware.cors import CORSMiddleware
from util.config import Settings
from util.message_store import MessageStore as messagestore
from util.auth import verify_api_key
from models.models import TemplateCreateRequest, WhatsAppTemplateRequest, SmsRequest


app = FastAPI(
    title="WhatsApp Sender API",
    description="An API to send WhatsApp messages via Facebook Graph API",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_settings() -> Settings:
    return Settings()


message_store = messagestore(get_settings())


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
    settings: Settings = Depends(get_settings),
    api_key: str = Security(verify_api_key)
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
            "components": payload.components,
        },
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                api_url, headers=headers, json=facebook_payload, timeout=10.0
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
async def get_templates(
    settings: Settings = Depends(get_settings),
    api_key: str = Security(verify_api_key)
):
    api_url = f"https://graph.facebook.com/{settings.facebook_api_version}/{settings.facebook_app_id}/message_templates"

    headers = {
        "Authorization": f"Bearer {settings.facebook_api_token}",
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(api_url, headers=headers, timeout=10.0)

            response.raise_for_status()
            templates_data = response.json()

            templates = []
            for template in templates_data.get("data", []):
                templates.append(
                    {
                        "id": template.get("id"),
                        "name": template.get("name"),
                        "language": template.get("language"),
                        "components": template.get("components", []),
                        "status": template.get("status"),
                        "category": template.get("category"),
                    }
                )

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
                detail=f"Facebook API Error: {exc.response.json()}",
            )
        except Exception as e:
            print(f"An unexpected error occurred: {e}")
            raise HTTPException(
                status_code=500, detail="An internal server error occurred."
            )


@app.post("/templates")
async def create_template(
    template: TemplateCreateRequest, 
    settings: Settings = Depends(get_settings),
    api_key: str = Security(verify_api_key)
):
    api_url = f"https://graph.facebook.com/{settings.facebook_api_version}/{settings.facebook_app_id}/message_templates"

    headers = {
        "Authorization": f"Bearer {settings.facebook_api_token}",
        "Content-Type": "application/json",
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                api_url,
                headers=headers,
                json=template.dict(exclude_none=True),
                timeout=10.0,
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


@app.post("/send-sms")
async def send_sms(
    sms_request: SmsRequest, 
    settings: Settings = Depends(get_settings),
    api_key: str = Security(verify_api_key)
):

    import boto3

    sns_client = boto3.client(
        "sns",
        aws_access_key_id=settings.aws_access_key_id,
        aws_secret_access_key=settings.aws_secret_access_key,
        region_name=settings.aws_region,
    )

    try:
        response = sns_client.publish(
            PhoneNumber=sms_request.phoneNumber, Message=sms_request.message
        )
        print(f"Message sent with ID: {response['MessageId']}")
        return {
            "status": "success",
            "messageId": response['MessageId']
        }
    except Exception as e:
        print(f"Error sending message: {e}")
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )