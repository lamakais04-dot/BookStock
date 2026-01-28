from fastapi import APIRouter, Query
from services.ageServices import (
    get_ages
)

router = APIRouter()

@router.get("/")
def get_ages_route():
    return get_ages()
