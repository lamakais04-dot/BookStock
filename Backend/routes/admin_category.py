# routes/admin_categories.py
from fastapi import APIRouter, Depends
from utils.admin_helper import get_admin_user
from services.categoriyServices import (
    get_categories,
    create_category,
    update_category,
    delete_category,
)
from schemas.categories import category, categoryUpdate

router = APIRouter(prefix="/admin/categories", tags=["admin-categories"])


@router.get("/", dependencies=[Depends(get_admin_user)])
def list_categories():
    return get_categories()


@router.post("/", dependencies=[Depends(get_admin_user)])
def add_category(data: category):
    return create_category(data)


@router.put("/{category_id}", dependencies=[Depends(get_admin_user)])
def edit_category(category_id: int, data: categoryUpdate):
    return update_category(category_id, data)


@router.delete("/{category_id}", dependencies=[Depends(get_admin_user)])
def remove_category(category_id: int):
    return delete_category(category_id)
