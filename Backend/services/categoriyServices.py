# services/categoryService.py
from sqlmodel import Session, select
from fastapi import HTTPException
from db import engine
from models.categories import categories
from schemas.categories import category, categoryUpdate


def get_categories():
    with Session(engine) as session:
        return session.exec(select(categories)).all()


def create_category(data: category):
    with Session(engine) as session:
        exists = session.exec(
            select(categories).where(categories.name == data.name)
        ).first()

        if exists:
            raise HTTPException(400, "Category already exists")

        category = categories(name=data.name)
        session.add(category)
        session.commit()
        session.refresh(category)
        return category


def update_category(category_id: int, data: categoryUpdate):
    with Session(engine) as session:
        category = session.get(categories, category_id)
        if not category:
            raise HTTPException(404, "Category not found")

        category.name = data.name
        session.commit()
        session.refresh(category)
        return category


def delete_category(category_id: int):
    with Session(engine) as session:
        category = session.get(categories, category_id)
        if not category:
            raise HTTPException(404, "Category not found")

        session.delete(category)
        session.commit()
        return {"message": "Category deleted"}
