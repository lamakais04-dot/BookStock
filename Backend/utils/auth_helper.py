import jwt
import os
from fastapi import Cookie, HTTPException
from sqlmodel import Session
from db import engine
from models.users import Users


def get_user(access_token: str | None = Cookie(default=None)):
    if access_token is None:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        payload = jwt.decode(access_token, os.getenv("JWT_SECRET"), algorithms=["HS256"])
        user_id = payload["userId"]

        with Session(engine) as session:
            db_user = session.get(Users, user_id)

            if not db_user:
                raise HTTPException(status_code=401, detail="User not found")

            return {
                "id": db_user.id,
                "role": db_user.role,
                "is_blocked": db_user.is_blocked,
            }

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
