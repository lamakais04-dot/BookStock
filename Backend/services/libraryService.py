from sqlmodel import Session, select
from fastapi import HTTPException

from db import engine
from models.library import Library
from models.books import books


# =========================
# Check if user can borrow
# =========================
def can_borrow(user_id: int) -> bool:
    """
    Returns True if the user can borrow another book (less than 2 borrowed).
    """

    with Session(engine) as session:
        library = session.exec(
            select(Library).where(Library.userid == user_id)
        ).first()

        # User has no borrowed books yet
        if not library:
            return True

        # User already borrowed 2 books
        if library.book1id is not None and library.book2id is not None:
            return False

        return True


# =========================
# Borrow book
# =========================

def borrow_book(user_id: int, book_id: int):
    with Session(engine) as session:

        # 🔒 Lock the book row
        book = session.exec(
            select(books)
            .where(books.id == book_id)
            .with_for_update()
        ).first()

        if not book:
            raise HTTPException(404, "הספר לא קיים")

        if book.quantity <= 0:
            raise HTTPException(400, "אין עותקים זמינים")

        library = session.exec(
            select(Library).where(Library.userid == user_id)
        ).first()

        # max 2 books
        if library and library.book1id and library.book2id:
            raise HTTPException(400, "מקסימום 2 ספרים")

        # duplicate
        if library and book_id in [library.book1id, library.book2id]:
            raise HTTPException(400, "הספר כבר מושאל")

        # assign
        if not library:
            library = Library(userid=user_id, book1id=book_id)
            session.add(library)
        elif library.book1id is None:
            library.book1id = book_id
        else:
            library.book2id = book_id

        # ⬇️ decrease quantity
        book.quantity -= 1

        session.commit()

        borrowed_books = [
            b for b in [library.book1id, library.book2id] if b is not None
        ]

        return {
            "message": "📚 הספר הושאל בהצלחה",
            "borrowedBooks": borrowed_books,
            "canBorrow": len(borrowed_books) < 2
        }



def get_borrowed_books(user_id: int) -> list[int]:
    with Session(engine) as session:
        library = session.exec(
            select(Library).where(Library.userid == user_id)
        ).first()

        if not library:
            return []

        return [
            book_id
            for book_id in [library.book1id, library.book2id]
            if book_id is not None
        ]
