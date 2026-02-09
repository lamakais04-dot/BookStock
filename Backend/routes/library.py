from fastapi import APIRouter, Depends, BackgroundTasks
from utils.auth_helper import get_user
from services.libraryService import (
    borrow_book,
    can_borrow,
    return_book,
    get_user_borrowed_books,
)
from utils.active_user_helper import get_active_user
from socketio_app import sio

router = APIRouter()

@router.post("/borrow/{book_id}")
async def borrow(book_id: int, background_tasks: BackgroundTasks, user=Depends(get_active_user)):
    result = borrow_book(user["id"], book_id)

    # notify all clients:
    # - books list changed (quantity)
    # - activity changed (borrow)
    # - this user's profile/borrowed books changed
    background_tasks.add_task(
        sio.emit,
        "borrow_return_changed",
        {
            "type": "borrow",
            "user_id": user["id"],
            "book_id": book_id,
        },
    )
    background_tasks.add_task(
        sio.emit,
        "books_changed",
        {"reason": "borrowed", "id": book_id},
    )
    background_tasks.add_task(
        sio.emit,
        "profile_updated",
        {"user_id": user["id"]},
    )

    return result

@router.get("/can-borrow")
def can_borrow_route(user=Depends(get_user)):
    allowed = can_borrow(user["id"])
    return {"allowed": allowed}

@router.post("/return/{book_id}")
async def returnb(book_id: int, background_tasks: BackgroundTasks, user=Depends(get_active_user)):
    result = return_book(user["id"], book_id)

    background_tasks.add_task(
        sio.emit,
        "borrow_return_changed",
        {
            "type": "return",
            "user_id": user["id"],
            "book_id": book_id,
        },
    )
    background_tasks.add_task(
        sio.emit,
        "books_changed",
        {"reason": "returned", "id": book_id, "userId" : user["id"]},
    )
    background_tasks.add_task(
        sio.emit,
        "profile_updated",
        {"user_id": user["id"]},
    )

    return result

@router.get("/my-books")
def my_books(user=Depends(get_user)):
    return get_user_borrowed_books(user["id"])
