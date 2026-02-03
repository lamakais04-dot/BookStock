# routers/admin_users.py
from fastapi import APIRouter, Depends, Query
from typing import List

from utils.admin_helper import get_admin_user
from schemas.admin_users import AdminUserRow, BorrowRow
from services.adminService import (
    admin_get_users_service,
    admin_get_user_borrows_service,
)
from schemas.admin_users import BlockUserResponse
from services.adminService import admin_toggle_user_block_service


router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/users", response_model=List[AdminUserRow], dependencies=[Depends(get_admin_user)])
def admin_get_users(q: str = Query(default="", description="search by name/email")):
    return admin_get_users_service(q)


@router.get("/users/{user_id}/borrows", response_model=List[BorrowRow], dependencies=[Depends(get_admin_user)])
def admin_get_user_borrows(
    user_id: int,
    only_open: bool = Query(False, description="only currently borrowed"),
):
    return admin_get_user_borrows_service(user_id, only_open)

@router.patch(
    "/users/{user_id}/block",
    response_model=BlockUserResponse,
    dependencies=[Depends(get_admin_user)]
)
def admin_toggle_user_block(user_id: int):
    return admin_toggle_user_block_service(user_id)
