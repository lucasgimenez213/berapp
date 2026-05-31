# Berapp — Controle de Estoque de Insumos

Sistema de controle de estoque de insumos médicos para home care, com alertas via Telegram e entrada/saída por linguagem natural via Claude AI.

## Stack

- **API:** Python + FastAPI + Motor (async MongoDB)
- **Banco:** MongoDB Atlas M0 (free)
- **IA:** Claude Haiku (Anthropic API)
- **Notificações:** Telegram Bot
- **Deploy:** Render.com (Docker)

## Funcionalidades

- Cadastro de itens com quantidade mínima e validade
- Registro de entradas e saídas de estoque
- Alerta automático diário via Telegram quando estoque está abaixo do mínimo ou item está próximo do vencimento
- Comando em linguagem natural via Telegram: *"entrada de 10 seringas 20ml"*, *"saiu 1 midazolam"*

## Estrutura

```
berapp/
└── backend/
    ├── Dockerfile
    ├── requirements.txt
    └── app/
        ├── main.py
        ├── database.py
        ├── models/
        │   ├── item.py
        │   └── movimentacao.py
        ├── routes/
        │   ├── itens.py
        │   ├── movimentacoes.py
        │   ├── cron.py
        │   └── webhook.py
        └── services/
            ├── telegram.py
            ├── claude_service.py
            └── cron.py
```

## Variáveis de ambiente

Crie um arquivo `backend/.env` baseado no exemplo abaixo:

```env
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/?appName=Cluster0
DB_NAME=berapp
TELEGRAM_TOKEN=seu_token_do_botfather
TELEGRAM_CHAT_ID=seu_chat_id
ANTHROPIC_API_KEY=sua_chave_anthropic
RENDER_URL=https://sua-url.onrender.com
```

## Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/itens` | Lista todos os itens |
| POST | `/itens` | Cadastra novo item |
| PUT | `/itens/{id}` | Atualiza item |
| DELETE | `/itens/{id}` | Remove item |
| GET | `/movimentacoes` | Lista movimentações |
| POST | `/movimentacoes` | Registra entrada ou saída |
| POST | `/cron/check` | Dispara verificação de estoque (chamado pelo Render Cron Job) |
| POST | `/webhook/telegram` | Recebe mensagens do Telegram |

## Documentação interativa

Com a API rodando, acesse `/docs` para a interface Swagger gerada automaticamente pelo FastAPI.
