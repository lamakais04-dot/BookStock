from fastapi import Depends, HTTPException
from utils.auth_helper import get_user


def get_admin_user(user=Depends(get_user)):
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    # Use dictionary access since get_user returns a dict
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    return user
