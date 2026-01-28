from fastapi import APIRouter, Query,Depends
from utils.auth_helper import get_user
from services.ageServices import (
    get_ages
)

router = APIRouter()

@router.get("/")
def get_ages_route(user=Depends(get_user)):
    return get_ages()
