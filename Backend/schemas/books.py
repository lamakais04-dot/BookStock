from pydantic import BaseModel

class BookCreate(BaseModel):
    title: str
    summary: str
    author: str
    quantity: int
    pages: int
    categoryid: int
    agesid: int

class BookUpdate(BaseModel):
    title: str | None = None
    summary: str | None = None
    author: str | None = None
    quantity: int | None = None
    pages: int | None = None
    categoryid: int | None = None
    agesid: int | None = None
