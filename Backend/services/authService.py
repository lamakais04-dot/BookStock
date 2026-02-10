from sqlmodel import Session, select
from fastapi import HTTPException, UploadFile
from pwdlib import PasswordHash
from datetime import datetime, timedelta, timezone
import jwt
import os
import uuid
import boto3
from botocore.exceptions import ClientError

from db import engine
from models.users import Users
from schemas.users import NewUser, LoginData
from services.libraryService import can_borrow, get_borrowed_books

password_hash = PasswordHash.recommended()


# ---------- SIGNUP ----------

def signup_user(user_req: NewUser):
    with Session(engine) as session:
        user_dict = user_req.model_dump()
        hashed_password = password_hash.hash(user_dict.pop("password"))

        user = Users(**user_dict, hashedpass=hashed_password)
        session.add(user)
        session.commit()
        session.refresh(user)

        return {
            "id": user.id,
            "firstname": user.firstname,
            "lastname": user.lastname,
            "email": user.email,
        }


# ---------- LOGIN ----------

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
            "is_blocked": user.is_blocked,
        }


# ---------- PROFILE ----------

def get_user_profile(user_obj):
    with Session(engine) as session:
        user = session.get(Users, user_obj["id"])
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        user_data = user.model_dump()
        borrowed = get_borrowed_books(user.id)

        user_data["borrowedBooks"] = borrowed
        user_data["canBorrow"] = len(borrowed) < 2

        return user_data


def update_user_profile(user_id: int, data: dict):
    with Session(engine) as session:
        user = session.get(Users, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        for key, value in data.items():
            setattr(user, key, value)

        session.commit()
        session.refresh(user)

        user_data = user.model_dump()
        user_data["borrowedBooks"] = get_borrowed_books(user.id)
        user_data["canBorrow"] = len(user_data["borrowedBooks"]) < 2

        return user_data


# ---------- IMAGE UPLOAD ----------

def upload_user_image(image_file: UploadFile, user_id: int) -> dict:
    image_url = upload_image_to_s3(image_file, "users")

    with Session(engine) as session:
        user = session.get(Users, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        user.image = image_url
        session.commit()
        session.refresh(user)

    return {"image": image_url}


def upload_image_to_s3(image_file: UploadFile, folder: str) -> str:
    s3_client = boto3.client(
        "s3",
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
        region_name=os.getenv("AWS_DEFAULT_REGION"),
    )

    ext = image_file.filename.split(".")[-1]
    key = f"public/{folder}/{uuid.uuid4()}.{ext}"

    extra_args = {
        "ContentType": image_file.content_type or "application/octet-stream",
        "ACL": "public-read",
    }

    try:
        s3_client.upload_fileobj(
            image_file.file,
            os.getenv("AWS_BUCKET_NAME"),
            key,
            ExtraArgs=extra_args,
        )
    except ClientError as e:
        # Buckets with Object Ownership = Bucket owner enforced do not allow ACLs.
        # In that case upload without ACL and rely on bucket policy for public access.
        if e.response.get("Error", {}).get("Code") != "AccessControlListNotSupported":
            raise
        image_file.file.seek(0)
        s3_client.upload_fileobj(
            image_file.file,
            os.getenv("AWS_BUCKET_NAME"),
            key,
            ExtraArgs={"ContentType": image_file.content_type or "application/octet-stream"},
        )

    return (
        f"https://{os.getenv('AWS_BUCKET_NAME')}"
        f".s3.{os.getenv('AWS_DEFAULT_REGION')}.amazonaws.com/{key}"
    )


# ---------- JWT ----------

def create_token(user: Users):
    secret_key = os.getenv("JWT_SECRET")
    expire = datetime.now(timezone.utc) + timedelta(days=1)
    payload = {"userId": user.id, "exp": expire, "role": user.role}
    return jwt.encode(payload, secret_key, "HS256")
