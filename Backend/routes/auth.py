from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from fastapi.responses import Response
from schemas.users import NewUser, LoginData
from services.authService import (
    signup_user,
    login_user,
    upload_user_image,
    get_user_profile,
    update_user_profile,
)
from services.bookService import get_book_by_id
from utils.auth_helper import get_user

router = APIRouter()


@router.post("/signup", status_code=201)
def sign_up(user_req: NewUser):
    return signup_user(user_req)


@router.post("/login")
def login(login_req: LoginData, response: Response):
    return login_user(login_req, response)


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(key="access_token", path="/")
    return {"message": "Logged out successfully"}


@router.get("/me")
def me(user=Depends(get_user)):
    return get_user_profile(user)

@router.post("/uploadImage")
def upload_image(
    image_file: UploadFile = File(...),
    user=Depends(get_user),
):
    return upload_user_image(image_file, user["id"])


@router.get("/{book_id}")
def get_book_by_id_route(book_id: int, user=Depends(get_user)):
    book = get_book_by_id(book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    return book


@router.put("/update-profile")
def update_profile(data: dict, user=Depends(get_user)):
    return update_user_profile(user["id"], data)
