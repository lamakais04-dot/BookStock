from sqlmodel import Session, select
from sqlalchemy.sql import func
from sqlalchemy import or_
from fastapi import HTTPException, UploadFile
from db import engine
from models.books import books
from models.library import Library
from models.borrow_history import BorrowHistory
from schemas.books import BookCreate, BookUpdate
from services.authService import upload_image_to_s3


# ===============================
# 🔹 Utilities
# ===============================

def _normalized_title(value: str) -> str:
    return " ".join(value.split()).strip()


# ===============================
# 🔹 Query Builders (SRP)
# ===============================

def _build_books_query(category_id, age_group_id, search):
    query = select(books)

    if category_id:
        query = query.where(books.categoryid == category_id)

    if age_group_id:
        query = query.where(books.agesid == age_group_id)

    if search:
        query = query.where(
            or_(
                books.title.ilike(f"%{search}%"),
                books.author.ilike(f"%{search}%"),
                books.summary.ilike(f"%{search}%"),
            )
        )

    return query


def _count_books(session: Session, query):
    return session.exec(
        select(func.count()).select_from(query.subquery())
    ).one()


def _paginate_books(session: Session, query, page: int, limit: int):
    offset = (page - 1) * limit
    return session.exec(query.offset(offset).limit(limit)).all()


def _get_books_statistics(session: Session):
    # total available copies (quantity field)
    available_books = session.exec(
        select(func.coalesce(func.sum(books.quantity), 0)).select_from(books)
    ).one()

    # borrowed copies (occupied slots in Library)
    borrowed_slots = session.exec(
        select(
            func.coalesce(func.count(Library.book1id), 0)
            + func.coalesce(func.count(Library.book2id), 0)
        ).select_from(Library)
    ).one()

    total_books = available_books + borrowed_slots

    return {
        "totalBooks": total_books,
        "borrowedBooks": borrowed_slots,
        "availableBooks": available_books,
    }


# ===============================
# 🔹 Main Public Functions
# ===============================

def get_books(
    page: int = 1,
    limit: int = 8,
    category_id: int | None = None,
    age_group_id: int | None = None,
    search: str | None = None,
):
    with Session(engine) as session:
        query = _build_books_query(category_id, age_group_id, search)

        total = _count_books(session, query)
        books_list = _paginate_books(session, query, page, limit)
        stats = _get_books_statistics(session)

        return {
            "books": books_list,
            "totalPages": (total + limit - 1) // limit,
            "currentPage": page,
            **stats,
        }


def get_random_books(limit: int = 10):
    with Session(engine) as session:
        return session.exec(
            select(books).order_by(func.random()).limit(limit)
        ).all()


def get_book_by_id(book_id: int):
    with Session(engine) as session:
        book = session.get(books, book_id)
        if not book:
            raise HTTPException(404, "Book not found")
        return book


def create_book(data: BookCreate, image_file: UploadFile | None):
    image_url = upload_image_to_s3(image_file, "books") if image_file else None
    normalized_title = _normalized_title(data.title)

    with Session(engine) as session:
        exists = session.exec(
            select(books).where(func.lower(books.title) == normalized_title.lower())
        ).first()

        if exists:
            raise HTTPException(400, "כבר קיים ספר עם שם זה")

        payload = data.model_dump()
        payload["title"] = normalized_title

        new_book = books(
            **payload,
            image=image_url,
        )

        session.add(new_book)
        session.commit()
        session.refresh(new_book)
        return new_book


def update_book(book_id: int, data: BookUpdate, image_file: UploadFile | None):
    with Session(engine) as session:
        book = session.get(books, book_id)
        if not book:
            raise HTTPException(404, "Book not found")

        updates = data.model_dump(exclude_none=True)

        if "title" in updates:
            normalized_title = _normalized_title(updates["title"])

            exists = session.exec(
                select(books).where(
                    func.lower(books.title) == normalized_title.lower(),
                    books.id != book_id,
                )
            ).first()

            if exists:
                raise HTTPException(400, "כבר קיים ספר עם שם זה")

            updates["title"] = normalized_title

        for key, value in updates.items():
            setattr(book, key, value)

        if image_file:
            book.image = upload_image_to_s3(image_file, "books")

        session.commit()
        session.refresh(book)
        return book


def delete_book(book_id: int):
    with Session(engine) as session:
        book = session.get(books, book_id)
        if not book:
            raise HTTPException(404, "Book not found")

        session.delete(book)
        session.commit()
        return {"message": "Book deleted"}
