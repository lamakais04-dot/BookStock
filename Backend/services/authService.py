from sqlmodel import Session, select
from fastapi import HTTPException, UploadFile
from pwdlib import PasswordHash
from services.libraryService import can_borrow, get_borrowed_books
from datetime import datetime, timedelta, timezone
import jwt
import os
import uuid
import boto3

from db import engine
from models.users import Users
from schemas.users import NewUser, LoginData

password_hash = PasswordHash.recommended()


def signup_user(user_req: NewUser):
    with Session(engine) as session:
        user_dict = user_req.model_dump()
        hashed_password = password_hash.hash(user_dict["password"])
        del user_dict["password"]

        user = Users(**user_dict, hashedpass=hashed_password)
        session.add(user)
        session.commit()
        session.refresh(user)
        return user


def login_user(login_req: LoginData, response):
    with Session(engine) as session:
        statement = select(Users).where(Users.email == login_req.email)
        user = session.exec(statement).first()

        if not user or not password_hash.verify(login_req.password, user.hashedpass):
            raise HTTPException(status_code=401, detail="Invalid email or password")

        token = create_token(user)
        response.set_cookie(
            key="access_token",
            value=token,
            httponly=True,
            samesite="lax",
            secure=False,
            path="/",
        )


    return {
        "id": user.id,
        "firstname": user.firstname,
        "lastname": user.lastname,
        "email": user.email,
        "role": user.role,
        "borrowedBooks": get_borrowed_books(user.id),
        "canBorrow": can_borrow(user.id),
    }



def get_user_profile(user_obj):
    with Session(engine) as session:
        user = session.get(Users, user_obj["id"])

        if not user:
            raise HTTPException(status_code=404, detail="This user does not exist")

        user_data = user.model_dump()

        borrowed_books = get_borrowed_books(user.id)

        user_data["borrowedBooks"] = borrowed_books
        user_data["canBorrow"] = len(borrowed_books) < 2

        return user_data


def upload_user_image(image_file: UploadFile):
    s3_client = boto3.client("s3")

    file_extension = image_file.filename.split(".")[-1]
    new_file_name = f"public/users/{uuid.uuid4()}.{file_extension}"

    s3_client.upload_fileobj(
        image_file.file,
        "book-stock-bucket",
        new_file_name,
        ExtraArgs={"ContentType": image_file.content_type},
    )

    return f"https://book-stock-bucket.s3.eu-north-1.amazonaws.com/{new_file_name}"


def create_token(user: Users):
    secret_key = os.getenv("JWT_SECRET")
    expire = datetime.now(timezone.utc) + timedelta(days=1)
    payload = {"userId": user.id, "exp": expire, "role": user.role}
    jwtToken = jwt.encode(payload, secret_key, "HS256")
    return jwtToken
