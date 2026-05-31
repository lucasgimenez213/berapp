from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()

client = AsyncIOMotorClient(os.getenv("MONGODB_URI"))
db = client[os.getenv("DB_NAME", "berapp")]

itens_collection = db["itens"]
movimentacoes_collection = db["movimentacoes"]
