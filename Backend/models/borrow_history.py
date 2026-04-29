  # models/borrow_history.py
from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field

class BorrowHistory(SQLModel, table=True):
    __tablename__ = "borrow_history"
    id: Optional[int] = Field(default=None, primary_key=True)

    user_id: int = Field(index=True, foreign_key="users.id")
    book_id: int = Field(index=True, foreign_key="books.id")

    borrowed_at: datetime = Field(index=True)
    returned_at: Optional[datetime] = Field(default=None, index=True)
