from sqlmodel import SQLModel, Field
from typing import Optional

class Library(SQLModel, table=True):
    __tablename__ = "library"

    id: int | None = Field(primary_key=True, default=None)
    userid: int
    book1id: Optional[int] = None
    book2id: Optional[int] = None
