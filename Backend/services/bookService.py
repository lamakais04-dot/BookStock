from sqlmodel import Session, select
from db import engine
from models.books import books
from sqlalchemy.sql import func

def get_books():
    with Session(engine) as session:
        statement = select(books)
        response = session.exec(statement).all()
        return response
    
def get_random_books(limit: int = 10):
    with Session(engine) as session:
        random_books = session.exec(select(books).order_by(func.random()).limit(limit)).all()
        return random_books