from sqlmodel import Session, select
from db import engine
from models.books import books
from models.ages import Ages
from sqlalchemy.sql import func
from fastapi import HTTPException
from sqlalchemy import or_



def get_books(
    page=1,
    limit=8,
    category_id=None,
    age_group_id=None,
    search: str | None = None,
):
    offset = (page - 1) * limit

    with Session(engine) as session:
        query = select(books)

        if category_id:
            query = query.where(books.categoryid == category_id)

        if age_group_id:
            query = query.where(books.agesid == age_group_id)

        if search:
            query = query.where(books.title.ilike(f"%{search}%"))

        # 🔢 סופרים אחרי כל הפילטרים
        total = session.exec(
            select(func.count()).select_from(query.subquery())
        ).one()

        books_list = session.exec(
            query.offset(offset).limit(limit)
        ).all()

        return {
            "books": books_list,
            "totalPages": (total + limit - 1) // limit,
            "currentPage": page,
        }


def get_random_books(limit: int = 10):
    with Session(engine) as session:
        random_books = session.exec(
            select(books).order_by(func.random()).limit(limit)
        ).all()
        return random_books


def get_book_by_id(id: int):
    with Session(engine) as session:
        book = session.get(books, id)
        if not book:
            raise HTTPException(status_code=404, detail="book not found")
        return book
