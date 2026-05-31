from fastapi import APIRouter
from app.services.cron import verificar_estoque

router = APIRouter()


@router.post("/check")
async def check_estoque():
    return await verificar_estoque()
