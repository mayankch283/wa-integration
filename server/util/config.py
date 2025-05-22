import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

load_dotenv()


class Settings(BaseSettings):
    facebook_api_token: str = os.getenv("FACEBOOK_API_TOKEN")
    facebook_phone_number_id: str = os.getenv("FACEBOOK_PHONE_NUMBER_ID")
    webhook_verify_token: str = os.getenv("WEBHOOK_VERIFY_TOKEN")
    facebook_app_id: str = os.getenv("FACEBOOK_APP_ID")
    facebook_api_version: str = "v22.0"
    supabase_url: str = os.getenv("SUPABASE_URL")
    supabase_key: str = os.getenv("SUPABASE_KEY")
    aws_access_key_id: str = os.getenv("AWS_ACCESS_KEY_ID")
    aws_secret_access_key: str = os.getenv("AWS_SECRET_ACCESS_KEY")
    aws_region: str = os.getenv("AWS_REGION")

    class Config:
        env_file = ".env"
