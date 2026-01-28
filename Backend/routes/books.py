from fastapi import APIRouter, Query
from services.bookService import (
    get_random_books,
    get_book_by_id,
    get_books
)

router = APIRouter()

@router.get("/")
def get_books_route(
    page: int = Query(1, ge=1),
    limit: int = Query(8, ge=1, le=50),
    category_id: int | None = Query(None),
    age_group_id: int | None = Query(None)
):
    return get_books(page, limit, category_id, age_group_id)



@router.get("/random/limit")
def get_random_books_route(limit: int = 10):
    return get_random_books(limit)


@router.get("/{book_id}")
def get_book_by_id_route(book_id: int):
    return get_book_by_id(book_id)
