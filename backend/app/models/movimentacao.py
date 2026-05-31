from pydantic import BaseModel, Field
from pydantic.functional_validators import BeforeValidator
from typing import Annotated, Optional, Literal
from datetime import datetime

PyObjectId = Annotated[str, BeforeValidator(str)]


class MovimentacaoCreate(BaseModel):
    item_id: str
    tipo: Literal["entrada", "saida"]
    quantidade: float
    observacoes: Optional[str] = ""


class MovimentacaoResponse(BaseModel):
    id: PyObjectId = Field(alias="_id")
    item_id: str
    tipo: str
    quantidade: float
    data: datetime
    observacoes: Optional[str] = ""

    model_config = {"populate_by_name": True}
