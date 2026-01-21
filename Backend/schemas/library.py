
from pydantic import BaseModel
from enum import Enum

class newlibrary(BaseModel):
    userid:int
    book1id:int
    book2id:int

class newlibraryUpdate(BaseModel):
    id:int | None = None
    userid:int | None = None
    book1id:int | None = None
    book2id:int | None = None