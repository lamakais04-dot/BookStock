from fastapi import APIRouter, Depends
from utils.auth_helper import get_user
from services.favoriteBooks import (
    add_favorite,
    remove_favorite,
    get_user_favorites
)

router = APIRouter()

@router.post("/{book_id}")
def add(book_id: int, user=Depends(get_user)):
    return add_favorite(user["id"], book_id)


@router.delete("/{book_id}")
def remove(book_id: int, user=Depends(get_user)):
    return remove_favorite(user["id"], book_id)


@router.get("/")
def get_all(user=Depends(get_user)):
    return get_user_favorites(user["id"])
