from fastapi import APIRouter, HTTPException
from bson import ObjectId
from app.database import itens_collection
from app.models.item import ItemCreate, ItemUpdate, ItemResponse

router = APIRouter()


@router.get("/", response_model=list[ItemResponse])
async def listar_itens():
    itens = await itens_collection.find().to_list(1000)
    return itens


@router.get("/{id}", response_model=ItemResponse)
async def buscar_item(id: str):
    item = await itens_collection.find_one({"_id": ObjectId(id)})
    if not item:
        raise HTTPException(status_code=404, detail="Item não encontrado")
    return item


@router.post("/", response_model=ItemResponse, status_code=201)
async def criar_item(item: ItemCreate):
    data = item.model_dump()
    result = await itens_collection.insert_one(data)
    created = await itens_collection.find_one({"_id": result.inserted_id})
    return created


@router.put("/{id}", response_model=ItemResponse)
async def atualizar_item(id: str, item: ItemUpdate):
    update_data = {k: v for k, v in item.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="Nenhum campo para atualizar")
    await itens_collection.update_one({"_id": ObjectId(id)}, {"$set": update_data})
    updated = await itens_collection.find_one({"_id": ObjectId(id)})
    return updated


@router.delete("/{id}")
async def deletar_item(id: str):
    result = await itens_collection.delete_one({"_id": ObjectId(id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Item não encontrado")
    return {"message": "Item deletado"}
