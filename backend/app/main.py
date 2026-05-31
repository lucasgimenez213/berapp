import os
import httpx
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import itens, movimentacoes, cron, webhook


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

app.include_router(itens.router, prefix="/itens", tags=["itens"])
app.include_router(movimentacoes.router, prefix="/movimentacoes", tags=["movimentacoes"])
app.include_router(cron.router, prefix="/cron", tags=["cron"])
app.include_router(webhook.router, prefix="/webhook", tags=["webhook"])


@app.get("/")
async def root():
    return {"status": "ok", "app": "Berapp"}
