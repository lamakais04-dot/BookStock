
from pydantic import BaseModel
from enum import Enum

class category(BaseModel):
    id:int | None = None
    name:str

class categoryUpdate(BaseModel):
    id:int | None = None
    name:str | None = None