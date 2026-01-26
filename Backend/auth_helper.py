import jwt
import os
from fastapi import Cookie, HTTPException


def get_user(access_token: str | None = Cookie(default=None)):
    if access_token is None:
        raise HTTPException(status_code=401, detail="Not authenticated")

    jwt_key = os.getenv("JWT_SECRET")
    payload = jwt.decode(access_token, jwt_key, algorithms=["HS256"])
    return {"id": payload["userId"], "isAdmin": payload.get("isAdmin", False)}
