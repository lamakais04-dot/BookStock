from fastapi import APIRouter
from services.bookService import get_books


router = APIRouter() 

@router.get("/")
def get_books_route():
    return get_books()
