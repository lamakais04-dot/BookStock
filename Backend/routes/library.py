from fastapi import APIRouter, Depends
from utils.auth_helper import get_user
from services.libraryService import borrow_book,can_borrow,return_book,get_user_borrowed_books

router = APIRouter()

@router.post("/borrow/{book_id}")
def borrow(book_id: int, user=Depends(get_user)):
    return borrow_book(user["id"], book_id)

@router.get("/can-borrow")
def can_borrow_route(user=Depends(get_user)):
    allowed = can_borrow(user["id"])
    return {"allowed": allowed}

@router.post("/return/{book_id}")
def returnb(book_id: int, user=Depends(get_user)):
    return return_book(user["id"], book_id)

@router.get("/my-books")
def my_books(user=Depends(get_user)):
    return get_user_borrowed_books(user["id"])

