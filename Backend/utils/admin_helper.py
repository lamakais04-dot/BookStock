from fastapi import Depends, HTTPException
from utils.auth_helper import get_user

def get_admin_user(user=Depends(get_user)):
    if user.get("is_blocked"):
        raise HTTPException(status_code=403, detail="Account blocked")
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    return user
