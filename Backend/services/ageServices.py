from sqlmodel import Session, select
from db import engine
from models.ages import Ages
from sqlalchemy.sql import func
from fastapi import HTTPException


def get_ages():
    with Session(engine) as session:
        statement = select(Ages)
        all_categories = session.exec(statement).all()
        return all_categories