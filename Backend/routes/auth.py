from fastapi import APIRouter, HTTPException, UploadFile, File, Depends
from pwdlib import PasswordHash
from sqlmodel import Session, select
from db import engine
from models.users import Users
from schemas.users import NewUser,LoginData
from fastapi.responses import  Response
import os
import boto3
import jwt
from datetime import datetime, timedelta, timezone
import uuid
from auth_helper import get_user


router = APIRouter()
password_hash = PasswordHash.recommended()


@router.post("/signup", status_code=201)
def signUp(user_req: NewUser):
    with Session(engine) as session:
        user_req_dict = user_req.model_dump()
        hashed_password = password_hash.hash(user_req_dict["password"])
        del user_req_dict["password"]
        user = Users(**user_req_dict, hashedpass=hashed_password)
        session.add(user)
        session.commit()
        session.refresh(user)
        return user


@router.post("/uploadImage")
def uploadImage(image_file: UploadFile = File()):
    s3_client = boto3.client("s3")
    splited_name_file = image_file.filename.split(".")
    file_extinsion = splited_name_file[len(splited_name_file) - 1]
    new_file_name = f"public/users/{uuid.uuid4()}.{file_extinsion}"
    s3_client.upload_fileobj(
        image_file.file,
        "book-stock-bucket",
        new_file_name,
        ExtraArgs={"ContentType": file_extinsion},
    )
    url = f"https://book-stock-bucket.s3.eu-north-1.amazonaws.com/{new_file_name}"
    return url


def createToken(user: Users):
    secret_key = os.getenv("JWT_SECRET")
    expire = datetime.now(timezone.utc) + timedelta(days=1)
    payload = {"userId": user.id, "exp": expire}
    jwtToken = jwt.encode(payload, secret_key, "HS256")
    return jwtToken


@router.post("/login")
def logIn(login_req: LoginData, response: Response):
    with Session(engine) as session:
        login_req_dict = login_req.model_dump()
        statement = select(Users).where(Users.email == login_req_dict["email"])
        user = session.exec(statement).first()
        if user is None:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        is_password_match = password_hash.verify(
            login_req_dict["password"], user.hashedpass)
        if not is_password_match:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        token = createToken(user)
        response.set_cookie(
            key="access_token", value=token, httponly=True, samesite="lax", secure=False)
        return user.id


@router.post("/logout")
def logout(response: Response, user= Depends(get_user)):
    response.delete_cookie(key="access_token", path="/")
    return {"message": "Logged out successfully"}


@router.get("/me")
def getUserProfile(userObj= Depends(get_user)):
    with Session(engine) as session:
        userId = userObj["id"]
        user = session.get(Users, userId)
        if not user:
            raise HTTPException(status_code=404, detail="This user does not exist")
        print(user)
        return user
