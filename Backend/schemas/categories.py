
from pydantic import BaseModel
from enum import Enum

class category(BaseModel):
    name:str

class categoryUpdate(BaseModel):
    name:str | None = None