import os
import httpx
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from jose import jwt, JWTError
from app.routes import itens, movimentacoes, cron, webhook, auth

SECRET_KEY = os.getenv("SECRET_KEY", "changeme-insecure")
ALGORITHM = "HS256"

PUBLIC_PATHS = {"/", "/auth/login", "/webhook/telegram", "/docs", "/openapi.json", "/redoc"}


@asynccontextmanager
async def lifespan(app: FastAPI):
    render_url = os.getenv("RENDER_URL")
    if render_url:
        token = os.getenv("TELEGRAM_TOKEN")
        async with httpx.AsyncClient() as client:
            await client.post(
                f"https://api.telegram.org/bot{token}/setWebhook",
                json={"url": f"{render_url}/webhook/telegram"}
            )
    yield


app = FastAPI(title="Berapp - Controle de Estoque do Bernardo", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def verify_token(request: Request, call_next):
    path = request.url.path
    if path in PUBLIC_PATHS or path.startswith("/docs") or path.startswith("/openapi"):
        return await call_next(request)

    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return JSONResponse(status_code=401, content={"detail": "Não autorizado"})

    token = auth_header.split(" ")[1]
    try:
        jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return JSONResponse(status_code=401, content={"detail": "Token inválido ou expirado"})

    return await call_next(request)


app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(itens.router, prefix="/itens", tags=["itens"])
app.include_router(movimentacoes.router, prefix="/movimentacoes", tags=["movimentacoes"])
app.include_router(cron.router, prefix="/cron", tags=["cron"])
app.include_router(webhook.router, prefix="/webhook", tags=["webhook"])


@app.get("/")
async def root():
    return {"status": "ok", "app": "Berapp"}
