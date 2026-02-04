# schemas/admin_activity.py
from datetime import  date
from pydantic import BaseModel

class ActivityRow(BaseModel):
    date: date                      # ✅ short date only
    action: str                     # "BORROW" | "RETURN"
    user_id: int
    firstname: str
    lastname: str
    book_id: int
    title: str

    class Config:
        orm_mode = True
