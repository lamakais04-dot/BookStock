from sqlmodel import Session, select
from fastapi import HTTPException
from sqlalchemy import update
from datetime import datetime

from db import engine
from models.library import Library
from models.books import books
from models.borrow_history import BorrowHistory


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

        # 🕘 ADD BORROW HISTORY
        history = BorrowHistory(
            user_id=user_id,
            book_id=book_id,
            borrowed_at=datetime.utcnow(),
            returned_at=None
        )
        session.add(history)

        session.commit()

        borrowed_books = [
            b for b in [library.book1id, library.book2id] if b is not None
        ]
        print(f"bowrrowed book{book_id}")
        return {
            "message": "📚 הספר הושאל בהצלחה",
            "borrowedBooks": borrowed_books,
            "canBorrow": len(borrowed_books) < 2,
        }


# =========================
# Get borrowed book IDs
# =========================
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


# =========================
# Get borrowed books (full objects)
# =========================
def get_user_borrowed_books(user_id: int):
    with Session(engine) as session:
        library = session.exec(
            select(Library).where(Library.userid == user_id)
        ).first()

        if not library:
            return []

        book_ids = [
            book_id
            for book_id in [library.book1id, library.book2id]
            if book_id is not None
        ]

        if not book_ids:
            return []

        return session.exec(
            select(books).where(books.id.in_(book_ids))
        ).all()


# =========================
# Return book
# =========================
def return_book(user_id: int, book_id: int):
    with Session(engine) as session:
        # check book
        book = session.exec(
            select(books).where(books.id == book_id)
        ).first()

        if not book:
            raise HTTPException(404, "הספר לא קיים")

        library = session.exec(
            select(Library).where(Library.userid == user_id)
        ).first()

        if not library:
            raise HTTPException(400, "למשתמש אין ספרים מושאלים")

        if book_id not in [library.book1id, library.book2id]:
            raise HTTPException(400, "הספר לא מושאל על ידי המשתמש")

        # remove from library
        if library.book1id == book_id:
            library.book1id = None
        else:
            library.book2id = None

        # ⬆️ increase quantity
        session.exec(
            update(books)
            .where(books.id == book_id)
            .values(quantity=books.quantity + 1)
        )

        # 🕘 UPDATE BORROW HISTORY (mark returned)
        history = session.exec(
            select(BorrowHistory)
            .where(
                BorrowHistory.user_id == user_id,
                BorrowHistory.book_id == book_id,
                BorrowHistory.returned_at.is_(None)
            )
            .order_by(BorrowHistory.borrowed_at.desc())
        ).first()

        if not history:
            raise HTTPException(400, "לא נמצאה השאלה פתוחה")

        history.returned_at = datetime.utcnow()

        session.commit()

        borrowed_books = [
            b for b in [library.book1id, library.book2id] if b is not None
        ]

        new_qty = session.exec(
            select(books.quantity).where(books.id == book_id)
        ).one()
        print(f"returned book{book_id}")
        return {
            "message": "📦 הספר הוחזר בהצלחה",
            "borrowedBooks": borrowed_books,
            "canBorrow": len(borrowed_books) < 2,
            "newQuantity": new_qty,
        }
