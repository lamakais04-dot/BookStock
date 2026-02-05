from fastapi import APIRouter, Depends, BackgroundTasks
from utils.auth_helper import get_user
from services.favoriteBooks import (
    add_favorite,
    remove_favorite,
    get_user_favorites
)
from utils.active_user_helper import get_active_user
from socketio_app import sio

router = APIRouter()

@router.post("/{book_id}")
async def add(book_id: int, background_tasks: BackgroundTasks, user=Depends(get_active_user)):
    result = add_favorite(user["id"], book_id)
    # notify this user's sessions that favorites changed
    background_tasks.add_task(
        sio.emit,
        "favorites_changed",
        {"user_id": user["id"], "book_id": book_id, "action": "added"},
    )
    return result

@router.delete("/{book_id}")
async def remove(book_id: int, background_tasks: BackgroundTasks, user=Depends(get_active_user)):
    result = remove_favorite(user["id"], book_id)
    background_tasks.add_task(
        sio.emit,
        "favorites_changed",
        {"user_id": user["id"], "book_id": book_id, "action": "removed"},
    )
    return result

@router.get("/")
def get_all(user=Depends(get_user)):
    return get_user_favorites(user["id"])
