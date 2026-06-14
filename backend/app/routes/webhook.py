import logging
from fastapi import APIRouter, Request
from bson import ObjectId
from datetime import datetime, timezone
from app.services.claude_service import processar_mensagem
from app.services.telegram import enviar_mensagem
from app.database import itens_collection, movimentacoes_collection

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/telegram")
async def telegram_webhook(request: Request):
    data = await request.json()

    message = data.get("message", {})
    texto = message.get("text", "")
    sender = message.get("from", {})
    nome_remetente = sender.get("first_name", "Telegram")

    if not texto:
        return {"ok": True}

    # remove menção ao bot se presente (ex: "@berapp_bot saida de 10 seringas")
    if texto.startswith("@"):
        texto = " ".join(texto.split()[1:]).strip()

    if not texto:
        return {"ok": True}

    try:
        resultado = await processar_mensagem(texto)
        acao = resultado.get("acao")

        if acao in ("entrada", "saida") and resultado.get("item_id") and resultado.get("quantidade"):
            item = await itens_collection.find_one({"_id": ObjectId(resultado["item_id"])})

            if item:
                if acao == "saida" and item["quantidade"] < resultado["quantidade"]:
                    await enviar_mensagem(
                        f"❌ Estoque insuficiente de <b>{item['nome']}</b>.\n"
                        f"Disponível: {item['quantidade']} {item['unidade']}"
                    )
                    return {"ok": True}

                delta = resultado["quantidade"] if acao == "entrada" else -resultado["quantidade"]
                await itens_collection.update_one(
                    {"_id": ObjectId(resultado["item_id"])},
                    {"$inc": {"quantidade": delta}}
                )
                await movimentacoes_collection.insert_one({
                    "item_id": resultado["item_id"],
                    "tipo": acao,
                    "quantidade": resultado["quantidade"],
                    "data": datetime.now(timezone.utc),
                    "observacoes": f"via Telegram ({nome_remetente}): {texto}"
                })

        await enviar_mensagem(resultado.get("resposta", "✅ Feito!"))

    except Exception as e:
        logger.error(f"Erro no webhook: {e}", exc_info=True)
        await enviar_mensagem("❌ Não entendi. Tente: 'entrada de 10 seringas' ou 'saiu 1 midazolam'")

    return {"ok": True}
