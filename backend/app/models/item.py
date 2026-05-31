from pydantic import BaseModel, Field
from pydantic.functional_validators import BeforeValidator
from typing import Annotated, Optional
from datetime import date

PyObjectId = Annotated[str, BeforeValidator(str)]


class ItemCreate(BaseModel):
    nome: str
    categoria: str
    quantidade: float
    unidade: str
    quantidade_minima: float
    validade: Optional[date] = None
    observacoes: Optional[str] = ""


class ItemUpdate(BaseModel):
    nome: Optional[str] = None
    categoria: Optional[str] = None
    quantidade: Optional[float] = None
    unidade: Optional[str] = None
    quantidade_minima: Optional[float] = None
    validade: Optional[date] = None
    observacoes: Optional[str] = None


class ItemResponse(BaseModel):
    id: PyObjectId = Field(alias="_id")
    nome: str
    categoria: str
    quantidade: float
    unidade: str
    quantidade_minima: float
    validade: Optional[date] = None
    observacoes: Optional[str] = ""

    model_config = {"populate_by_name": True}
