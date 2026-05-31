import os
import secrets
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, HTTPException
from jose import jwt
from pydantic import BaseModel

router = APIRouter()

SECRET_KEY = os.getenv("SECRET_KEY", "changeme-insecure")
ALGORITHM = "HS256"


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str


@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest):
    admin_user = os.getenv("ADMIN_USERNAME", "admin")
    admin_pass = os.getenv("ADMIN_PASSWORD", "")

    valid = (
        secrets.compare_digest(data.username, admin_user) and
        secrets.compare_digest(data.password, admin_pass)
    )

    if not valid:
        raise HTTPException(status_code=401, detail="Usuário ou senha inválidos")

    expire = datetime.now(timezone.utc) + timedelta(days=7)
    token = jwt.encode({"sub": data.username, "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)
    return {"access_token": token, "token_type": "bearer"}
