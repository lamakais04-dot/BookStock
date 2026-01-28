from sqlmodel import SQLModel, Field
from typing import Optional

class favorites(SQLModel, table=True):
    __tablename__ = "favoritebooks"  
    id: Optional[int] = Field(default=None, primary_key=True)
    userid: int = Field(foreign_key="users.id")
    bookid: int = Field(foreign_key="books.id")
