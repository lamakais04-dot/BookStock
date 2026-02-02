import jwt
import os
from fastapi import Cookie, HTTPException


def get_user(access_token: str | None = Cookie(default=None)):
    if access_token is None:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        payload = jwt.decode(
            access_token, os.getenv("JWT_SECRET"), algorithms=["HS256"]
        )
        return {
            "id": payload["userId"],
            "role": payload.get("role", "user"),
        }
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
