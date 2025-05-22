from fastapi import Security, HTTPException, Depends
from fastapi.security import APIKeyHeader
from util.config import Settings

api_key_header = APIKeyHeader(name="X-API-Key", auto_error=True)

async def verify_api_key(
    api_key: str = Security(api_key_header),
    settings: Settings = Depends(Settings)
) -> str:
    if api_key != settings.api_key:
        raise HTTPException(
            status_code=401,
            detail="Invalid API key"
        )
    return api_key