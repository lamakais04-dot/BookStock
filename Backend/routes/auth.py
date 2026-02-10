from fastapi import (
    APIRouter,
    UploadFile,
    File,
    Depends,
    HTTPException,
    Response,
    Cookie,
)
from schemas.users import NewUser, LoginData, UserUpdate
from utils.active_user_helper import get_active_user
from utils.auth_helper import get_user
from services.authService import (
    signup_user,
    login_user,
    upload_user_image,
    get_user_profile,
    update_user_profile,
)
from services.bookService import get_book_by_id

from socketio_app import sio


router = APIRouter()


# ---------- helper: user or None ----------

def get_user_or_none(access_token: str | None = Cookie(default=None)):
    # reuse existing get_user, but turn 401 into None
    if access_token is None:
        return None
    try:
        return get_user(access_token)
    except HTTPException as e:
        if e.status_code == 401:
            return None
        raise


# ---------- AUTH ----------

@router.post("/signup", status_code=201)
def sign_up(
    user_req: NewUser,
    user=Depends(get_user_or_none),
):
    # If already logged in, block signup
    if user:
        raise HTTPException(status_code=400, detail="Already logged in")
    return signup_user(user_req)


@router.post("/login")
def login(
    login_req: LoginData,
    response: Response,
    user=Depends(get_user_or_none),
):
    # If already logged in, block login
    if user:
        print("user exists")
        raise HTTPException(status_code=400, detail="Already logged in")
    return login_user(login_req, response)


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(
        key="access_token",
        path="/",
        httponly=True,
        samesite="lax",
        secure=False,
    )
    return {"message": "Logged out successfully"}


# ---------- USER ----------

@router.get("/me")
def me(user=Depends(get_user)):
    return get_user_profile(user)


@router.put("/update-profile")
async def update_profile(
    data: UserUpdate,
    user=Depends(get_active_user),
):
    updated = update_user_profile(user["id"], data.model_dump(exclude_none=True))
    # notify this user (and other sessions) that profile changed
    await sio.emit("profile_updated", {"user_id": user["id"]})
    return updated


@router.post("/uploadImage")
async def upload_image(
    image_file: UploadFile = File(...),
    user=Depends(get_active_user),
):
    result = upload_user_image(image_file, user["id"])
    await sio.emit("profile_updated", {"user_id": user["id"]})
    return result


# ---------- BOOK ----------

@router.get("/{book_id}")
def get_book_by_id_route(book_id: int, user=Depends(get_user)):
    book = get_book_by_id(book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    return book
