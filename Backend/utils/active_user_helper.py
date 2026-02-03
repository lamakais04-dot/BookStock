from fastapi import Depends, HTTPException
from utils.auth_helper import get_user

def get_active_user(user=Depends(get_user)):
    if user.get("is_blocked"):
        raise HTTPException(status_code=403, detail="Account blocked: read-only mode")
    return user
