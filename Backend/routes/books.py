from fastapi import APIRouter
from services.bookService import get_random_books, get_book_by_id, get_books


router = APIRouter() 

@router.get("/")
def get_books_route():
    return get_books()


@router.get("/{book_id}")
def get_book_by_id_route(book_id: int):
    return get_book_by_id(book_id)


@router.get("/random/limit")
def get_random_books_route():
    return get_random_books()

