from fastapi import APIRouter, Depends
from utils.auth_helper import get_user
from services.libraryService import borrow_book

router = APIRouter(prefix="/library")

@router.post("/borrow/{book_id}")
def borrow(book_id: int, user=Depends(get_user)):
    return borrow_book(user["id"], book_id)
