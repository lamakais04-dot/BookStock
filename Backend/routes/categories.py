from fastapi import APIRouter, Query,Depends
from utils.auth_helper import get_user
from services.categoriyServices import (
    get_categories
)

router = APIRouter()

@router.get("/")
def get_categories_route(user=Depends(get_user)):
    return get_categories()
