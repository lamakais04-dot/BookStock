
from sqlmodel import SQLModel,Field


class Library(SQLModel, table =True):
    __tablename__='library'
    id:int|None = Field(primary_key=True, default=None)
    userid : int
    book1id:int
    book2id:int
