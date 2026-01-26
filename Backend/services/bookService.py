from sqlmodel import Session, select
from db import engine
from models.books import books



def get_books():
    with Session(engine) as session:
        statement = select(books)
        response = session.exec(statement).all()
        return response