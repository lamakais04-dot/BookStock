from sqlmodel import Session, select
from sqlalchemy.sql import func
from sqlalchemy import or_
from fastapi import HTTPException, UploadFile
from db import engine
from models.books import books
from schemas.books import BookCreate, BookUpdate
from services.authService import upload_image_to_s3


def get_books(
    page: int = 1,
    limit: int = 8,
    category_id: int | None = None,
    age_group_id: int | None = None,
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
            query = query.where(
                or_(
                    books.title.ilike(f"%{search}%"),
                    books.author.ilike(f"%{search}%"),
                    books.summary.ilike(f"%{search}%"),
                )
            )

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
        return session.exec(
            select(books).order_by(func.random()).limit(limit)
        ).all()


def get_book_by_id(book_id: int):
    with Session(engine) as session:
        book = session.get(books, book_id)
        if not book:
            raise HTTPException(404, "Book not found")
        return book


def create_book(data: BookCreate, image_file: UploadFile):
    image_url = upload_image_to_s3(image_file, "books")

    new_book = books(
        **data.model_dump(),
        image=image_url,
    )

    with Session(engine) as session:
        session.add(new_book)
        session.commit()
        session.refresh(new_book)
        return new_book


def update_book(book_id: int, data: BookUpdate, image_file: UploadFile | None):
    with Session(engine) as session:
        book = session.get(books, book_id)
        if not book:
            raise HTTPException(404, "Book not found")

        for key, value in data.model_dump(exclude_none=True).items():
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
