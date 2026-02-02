# schemas/admin_activity.py
from datetime import datetime
from pydantic import BaseModel

class ActivityRow(BaseModel):
    date: datetime
    action: str  # "BORROW" | "RETURN"
    user_id: int
    firstname: str
    lastname: str
    book_id: int
    title: str
