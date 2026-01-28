from sqlmodel import Session, select
from db import engine
from models.favoriteBooks import favorites

def add_favorite(user_id: int, book_id: int):
    with Session(engine) as session:
        exists = session.exec(
            select(favorites)
            .where(favorites.userid == user_id)
            .where(favorites.bookid == book_id)
        ).first()

        if exists:
            return {"message": "Already favorite"}

        fav = favorites(userid=user_id, bookid=book_id)
        session.add(fav)
        session.commit()
        return {"message": "Added to favorites"}


def remove_favorite(user_id: int, book_id: int):
    with Session(engine) as session:
        fav = session.exec(
            select(favorites)
            .where(favorites.userid == user_id)
            .where(favorites.bookid == book_id)
        ).first()

        if fav:
            session.delete(fav)
            session.commit()

        return {"message": "Removed from favorites"}


def get_user_favorites(user_id: int):
    with Session(engine) as session:
        favoriteBooks = session.exec(
            select(favorites).where(favorites.userid == user_id)
        ).all()
        return favoriteBooks
