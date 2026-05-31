from fastapi import APIRouter, HTTPException
from bson import ObjectId
from datetime import datetime, timezone
from app.database import itens_collection, movimentacoes_collection
from app.models.movimentacao import MovimentacaoCreate, MovimentacaoResponse

router = APIRouter()


@router.get("/", response_model=list[MovimentacaoResponse])
async def listar_movimentacoes(item_id: str = None):
    filtro = {}
    if item_id:
        filtro["item_id"] = item_id
    movs = await movimentacoes_collection.find(filtro).sort("data", -1).to_list(1000)
    return movs


@router.post("/", response_model=MovimentacaoResponse, status_code=201)
async def criar_movimentacao(mov: MovimentacaoCreate):
    item = await itens_collection.find_one({"_id": ObjectId(mov.item_id)})
    if not item:
        raise HTTPException(status_code=404, detail="Item não encontrado")

    if mov.tipo == "saida" and item["quantidade"] < mov.quantidade:
        raise HTTPException(status_code=400, detail="Quantidade insuficiente em estoque")

    delta = mov.quantidade if mov.tipo == "entrada" else -mov.quantidade
    await itens_collection.update_one(
        {"_id": ObjectId(mov.item_id)},
        {"$inc": {"quantidade": delta}}
    )

    doc = mov.model_dump()
    doc["data"] = datetime.now(timezone.utc)
    result = await movimentacoes_collection.insert_one(doc)
    created = await movimentacoes_collection.find_one({"_id": result.inserted_id})
    return created
