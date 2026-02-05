# routes/admin_categories.py
from fastapi import APIRouter, Depends, BackgroundTasks
from utils.admin_helper import get_admin_user
from services.categoriyServices import (
    get_categories,
    create_category,
    update_category,
    delete_category,
)
from schemas.categories import category, categoryUpdate
from socketio_app import sio

router = APIRouter(prefix="/admin/categories", tags=["admin-categories"])

# Import sio from main

@router.get("/", dependencies=[Depends(get_admin_user)])
def list_categories():
    return get_categories()

@router.post("/", dependencies=[Depends(get_admin_user)])
async def add_category(data: category, background_tasks: BackgroundTasks):
    result = create_category(data)
    # Emit socket event to all clients
    background_tasks.add_task(sio.emit, "categories_changed", {"reason": "created"})
    return result

@router.put("/{category_id}", dependencies=[Depends(get_admin_user)])
async def edit_category(category_id: int, data: categoryUpdate, background_tasks: BackgroundTasks):
    result = update_category(category_id, data)
    background_tasks.add_task(sio.emit, "categories_changed", {"reason": "updated", "id": category_id})
    return result

@router.delete("/{category_id}", dependencies=[Depends(get_admin_user)])
async def remove_category(category_id: int, background_tasks: BackgroundTasks):
    result = delete_category(category_id)
    background_tasks.add_task(sio.emit, "categories_changed", {"reason": "deleted", "id": category_id})
    return result
