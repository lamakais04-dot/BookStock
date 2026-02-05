# routers/admin_activity.py
from fastapi import APIRouter, Depends, Query
from typing import List, Optional
from datetime import datetime
from socketio_app import sio

from utils.admin_helper import get_admin_user
from schemas.admin_activity import ActivityRow
from services.adminService import admin_activity_service

router = APIRouter(prefix="/admin", tags=["admin"])

@router.get("/activity", response_model=List[ActivityRow], dependencies=[Depends(get_admin_user)])
def admin_activity(
    user_id: Optional[int] = None,
    action: str = Query(default="ALL", description="ALL|BORROW|RETURN"),
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    limit: int = 200,
):
    return admin_activity_service(user_id, action, date_from, date_to, limit)
