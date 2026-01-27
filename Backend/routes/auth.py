from fastapi import APIRouter, UploadFile, File, Depends
from fastapi.responses import Response
from schemas.users import NewUser, LoginData
from services.authService import (
    signup_user,
    login_user,
    upload_user_image,
    get_user_profile
)
from utils.auth_helper import get_user

router = APIRouter()


@router.post("/signup", status_code=201)
def sign_up(user_req: NewUser):
    return signup_user(user_req)


@router.post("/login")
def login(login_req: LoginData, response: Response):
    return login_user(login_req, response)


@router.post("/logout")
def logout(response: Response, user=Depends(get_user)):
    response.delete_cookie(key="access_token", path="/")
    return {"message": "Logged out successfully"}


@router.get("/me")
def me(user=Depends(get_user)):
    return get_user_profile(user)


@router.post("/uploadImage")
def upload_image(image_file: UploadFile = File()):
    return upload_user_image(image_file)

