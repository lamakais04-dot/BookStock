from sqlmodel import Session, select
from db import engine
from models.categories import categories
from sqlalchemy.sql import func
from fastapi import HTTPException


def get_categories():
    with Session(engine) as session:
        statement = select(categories)
        all_categories = session.exec(statement).all()
        return all_categories