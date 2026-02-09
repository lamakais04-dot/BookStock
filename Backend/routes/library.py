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
from fastapi.encoders import jsonable_encoder

# NEW IMPORT: build full activity row for socket
from services.adminService import build_activity_row_for_event


router = APIRouter()



@router.post("/borrow/{book_id}")
async def borrow(book_id: int, user=Depends(get_active_user)):
    print("🟢 BORROW endpoint hit", book_id)

    result = borrow_book(user["id"], book_id)
    print("🟢 borrow_book result:", result)

    borrow_history_id = result.get("borrow_history_id")
    print("🟢 borrow_history_id:", borrow_history_id)

    activity_row = build_activity_row_for_event(borrow_history_id, "BORROW")
    print("🟢 activity row built")

    await sio.emit(
        "borrow_return_changed",
        {
            "type": "BORROW",
            "row": jsonable_encoder(activity_row),
        },
    )
    print("🟢 emitted borrow_return_changed (BORROW)")

    await sio.emit(
        "books_changed",
        {"reason": "borrowed", "id": book_id, "userId": user["id"]},
    )

    await sio.emit(
        "profile_updated",
        {"user_id": user["id"]},
    )

    return result

@router.get("/can-borrow")
def can_borrow_route(user=Depends(get_user)):
    allowed = can_borrow(user["id"])
    return {"allowed": allowed}



@router.post("/return/{book_id}")
async def returnb(book_id: int, user=Depends(get_active_user)):
    print("🟢 RETURN endpoint hit", book_id)

    result = return_book(user["id"], book_id)
    print("🟢 return_book result:", result)

    borrow_history_id = result.get("borrow_history_id")
    print("🟢 borrow_history_id:", borrow_history_id)

    activity_row = build_activity_row_for_event(borrow_history_id, "RETURN")
    print("🟡 built activity row:", activity_row)

    await sio.emit(
        "borrow_return_changed",
        {
            "type": "RETURN",
            "row": jsonable_encoder(activity_row),
        },
    )
    print("🟡 emitted borrow_return_changed")

    await sio.emit(
        "books_changed",
        {"reason": "returned", "id": book_id, "userId": user["id"]},
    )

    await sio.emit(
        "profile_updated",
        {"user_id": user["id"]},
    )

    return result


@router.get("/my-books")
def my_books(user=Depends(get_user)):
    return get_user_borrowed_books(user["id"])
