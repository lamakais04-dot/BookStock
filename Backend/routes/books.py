from fastapi import APIRouter
from services.bookService import get_books
from services.bookService import get_random_books


router = APIRouter() 

@router.get("/")
def get_books_route():
    return get_books()


@router.get("/random")
def get_random_books_route():
    return get_random_books()