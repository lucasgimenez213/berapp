from datetime import date
from app.database import itens_collection
from app.services.telegram import enviar_mensagem


async def verificar_estoque():
    itens = await itens_collection.find().to_list(1000)
    alertas = []

    for item in itens:
        if item["quantidade"] <= item["quantidade_minima"]:
            qtd = int(item['quantidade']) if item['quantidade'] == int(item['quantidade']) else item['quantidade']
            mini = int(item['quantidade_minima']) if item['quantidade_minima'] == int(item['quantidade_minima']) else item['quantidade_minima']
            alertas.append(
                f"⚠️ <b>{item['nome']}</b>: {qtd} {item['unidade']} restantes "
                f"(mínimo: {mini})"
            )

        if item.get("validade"):
            validade = item["validade"]
            if isinstance(validade, str):
                validade = date.fromisoformat(validade)
            dias = (validade - date.today()).days
            if 0 <= dias <= 30:
                alertas.append(
                    f"📅 <b>{item['nome']}</b>: vence em {dias} dias ({validade})"
                )

    if alertas:
        mensagem = "🏥 <b>Alerta de Estoque - Berapp</b>\n\n" + "\n".join(alertas)
        await enviar_mensagem(mensagem)

    return {"alertas_enviados": len(alertas)}
