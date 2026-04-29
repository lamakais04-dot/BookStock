# schemas/admin_users.py
from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class BorrowRow(BaseModel):
    book_id: int
    title: str
    borrowed_at: datetime
    returned_at: Optional[datetime]


class AdminUserRow(BaseModel):
    id: int
    firstname: str
    lastname: str
    email: str
    role: str

    is_blocked: bool  

    borrowed_now_count: int
    total_borrows: int


class BlockUserResponse(BaseModel):
    user_id: int
    is_blocked: bool
