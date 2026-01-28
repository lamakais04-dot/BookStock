from sqlmodel import Session, select
from db import engine
from models.library import Library
from fastapi import HTTPException


def borrow_book(user_id: int, book_id: int):
    with Session(engine) as session:
        library = session.exec(
            select(Library).where(Library.userid == user_id)
        ).first()

        # אם אין רשומה – יוצרים
        if not library:
            library = Library(userid=user_id, book1id=book_id)
            session.add(library)
            session.commit()
            return {"message": "Book borrowed (slot 1)"}

        # בדיקה שלא כבר מושאל
        if book_id in [library.book1id, library.book2id]:
            raise HTTPException(status_code=400, detail="Book already borrowed")

        # slot ראשון פנוי
        if library.book1id is None:
            library.book1id = book_id

        # slot שני פנוי
        elif library.book2id is None:
            library.book2id = book_id

        else:
            raise HTTPException(
                status_code=400,
                detail="You can borrow only 2 books"
            )

        session.add(library)
        session.commit()

        return {"message": "Book borrowed successfully"}
