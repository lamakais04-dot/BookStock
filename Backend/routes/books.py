from fastapi import APIRouter, UploadFile, File, Form, Depends, Query
from utils.auth_helper import get_user
from utils.admin_helper import get_admin_user
from services.bookService import (
    get_books,
    get_random_books,
    get_book_by_id,
    create_book,
    update_book,
    delete_book,
)
from schemas.books import BookCreate, BookUpdate

router = APIRouter()


@router.post("/", dependencies=[Depends(get_admin_user)])
def add_book(
    title: str = Form(...),
    summary: str = Form(...),
    author: str = Form(...),
    quantity: int = Form(...),
    pages: int = Form(...),
    categoryid: int = Form(...),
    agesid: int = Form(...),
    image: UploadFile = File(...),
):
    data = BookCreate(
        title=title,
        summary=summary,
        author=author,
        quantity=quantity,
        pages=pages,
        categoryid=categoryid,
        agesid=agesid,
    )
    return create_book(data, image)


@router.put("/{book_id}", dependencies=[Depends(get_admin_user)])
def edit_book(
    book_id: int,
    title: str | None = Form(None),
    summary: str | None = Form(None),
    author: str | None = Form(None),
    quantity: int | None = Form(None),
    pages: int | None = Form(None),
    categoryid: int | None = Form(None),
    agesid: int | None = Form(None),
    image: UploadFile | None = File(None),
):
    data = BookUpdate(
        title=title,
        summary=summary,
        author=author,
        quantity=quantity,
        pages=pages,
        categoryid=categoryid,
        agesid=agesid,
    )
    return update_book(book_id, data, image)


@router.delete("/{book_id}", dependencies=[Depends(get_admin_user)])
def remove_book(book_id: int):
    return delete_book(book_id)


@router.get("/")
def list_books(
    page: int = Query(1, ge=1),
    limit: int = Query(8, ge=1, le=50),
    category_id: int | None = None,
    age_group_id: int | None = None,
    search: str | None = None,
    user=Depends(get_user),
):
    return get_books(page, limit, category_id, age_group_id, search)


@router.get("/random/limit")
def random_books(limit: int = 10, user=Depends(get_user)):
    return get_random_books(limit)


@router.get("/{book_id}")
def single_book(book_id: int, user=Depends(get_user)):
    return get_book_by_id(book_id)
