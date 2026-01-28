from fastapi import APIRouter, Query
from services.categoriyServices import (
    get_categories
)

router = APIRouter()

@router.get("/")
def get_categories_route():
    return get_categories()
