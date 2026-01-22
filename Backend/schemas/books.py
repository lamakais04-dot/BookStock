
from pydantic import BaseModel
from enum import Enum

class book(BaseModel):
    title:str
    summary:str
    image:str | None = None
    quantity: int 
    pages: int
    agesid: int
    author: str
    categoryid:int

class bookUpdate(BaseModel):
    title:str | None = None
    summary:str | None = None
    categoryid:int | None = None
    image:str | None = None
    quantity:int | None = None
    pages:int | None = None
    agesid:int | None = None
    author:str | None = None