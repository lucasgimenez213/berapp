import anthropic
import json
import os
from app.database import itens_collection


async def processar_mensagem(mensagem: str) -> dict:
    itens = await itens_collection.find().to_list(1000)
    lista_itens = "\n".join([
        f"- {item['nome']} (id: {str(item['_id'])}, quantidade: {item['quantidade']} {item['unidade']})"
        for item in itens
    ]) or "Nenhum item cadastrado ainda."

    client = anthropic.AsyncAnthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

    response = await client.messages.create(
        model="claude-3-haiku-20240307",
        max_tokens=256,
        system=f"""Você é um assistente de controle de estoque de insumos médicos para home care do Bernardo.
O usuário manda mensagens em português descrevendo movimentações ou consultas de estoque.

Retorne APENAS um JSON válido com:
{{
  "acao": "entrada" | "saida" | "consulta" | "invalido",
  "item_id": "id do item ou null",
  "item_nome": "nome do item ou null",
  "quantidade": número ou null,
  "resposta": "mensagem curta e amigável de confirmação"
}}

Itens disponíveis no estoque:
{lista_itens}

Se o item não existir na lista, defina acao como "invalido" e explique na resposta.""",
        messages=[{"role": "user", "content": mensagem}]
    )

    return json.loads(response.content[0].text.strip())
