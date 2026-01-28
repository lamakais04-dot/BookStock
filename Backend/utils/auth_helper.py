import jwt
import os
from fastapi import Cookie, HTTPException


def get_user(access_token: str | None = Cookie(default=None)):
    if access_token is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        jwt_key = os.getenv("JWT_SECRET")
        payload = jwt.decode(access_token, jwt_key, algorithms=["HS256"])
        return {"id": payload["userId"], "role": payload.get("role", "user")}
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

