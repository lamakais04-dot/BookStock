from sqlmodel import Session, select
from db import engine
from models.books import books
from sqlalchemy.sql import func
from fastapi import HTTPException

def get_books():
    with Session(engine) as session:
        statement = select(books)
        response = session.exec(statement).all()
        return response
    
def get_random_books(limit: int = 10):
    with Session(engine) as session:
        random_books = session.exec(select(books).order_by(func.random()).limit(limit)).all()
        return random_books
    
def get_book_by_id(id: int):
    with Session(engine) as session:
        book = session.get(books,id)
        if not book:
            raise HTTPException(status_code=404, detail="book not found")
        return book