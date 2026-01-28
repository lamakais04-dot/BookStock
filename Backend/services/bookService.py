from sqlmodel import Session, select
from db import engine
from models.books import books
from sqlalchemy.sql import func
from fastapi import HTTPException


def get_books(page: int = 1, limit: int = 8):
    offset = (page - 1) * limit

    with Session(engine) as session:
        total = session.exec(select(func.count()).select_from(books)).one()

        books_list = session.exec(select(books).offset(offset).limit(limit)).all()

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
