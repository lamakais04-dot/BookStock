# services/adminService.py
from typing import List, Optional
from datetime import datetime

from sqlmodel import Session, select
from sqlalchemy import or_

from db import engine
from models.users import Users
from models.books import books
from models.borrow_history import BorrowHistory
from schemas.admin_users import AdminUserRow, BorrowRow
from schemas.admin_activity import ActivityRow


def admin_get_users_service(q: str = "") -> List[AdminUserRow]:
    with Session(engine) as session:
        stmt = select(Users)

        if q.strip():
            qq = f"%{q.strip()}%"
            stmt = stmt.where(
                or_(
                    Users.firstname.ilike(qq),
                    Users.lastname.ilike(qq),
                    Users.email.ilike(qq),
                )
            )

        users = session.exec(stmt).all()

        borrowed_now = session.exec(
            select(BorrowHistory.user_id)
            .where(BorrowHistory.returned_at.is_(None))
        ).all()

        total_borrows = session.exec(select(BorrowHistory.user_id)).all()

        borrowed_now_map = {}
        for uid in borrowed_now:
            borrowed_now_map[uid] = borrowed_now_map.get(uid, 0) + 1

        total_borrows_map = {}
        for uid in total_borrows:
            total_borrows_map[uid] = total_borrows_map.get(uid, 0) + 1

        return [
            AdminUserRow(
                id=u.id,
                firstname=u.firstname,
                lastname=u.lastname,
                email=u.email,
                role=u.role,
                borrowed_now_count=borrowed_now_map.get(u.id, 0),
                total_borrows=total_borrows_map.get(u.id, 0),
            )
            for u in users
        ]


def admin_get_user_borrows_service(user_id: int, only_open: bool = False) -> List[BorrowRow]:
    with Session(engine) as session:
        stmt = (
            select(BorrowHistory, books)
            .join(books, books.id == BorrowHistory.book_id)
            .where(BorrowHistory.user_id == user_id)
            .order_by(BorrowHistory.borrowed_at.desc())
        )

        if only_open:
            stmt = stmt.where(BorrowHistory.returned_at.is_(None))

        rows = session.exec(stmt).all()

        return [
            BorrowRow(
                book_id=b.id,
                title=b.title,
                borrowed_at=h.borrowed_at,
                returned_at=h.returned_at,
            )
            for (h, b) in rows
        ]


def admin_activity_service(
    user_id: Optional[int] = None,
    action: str = "ALL",  # ALL|BORROW|RETURN
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    limit: int = 200,
) -> List[ActivityRow]:
    with Session(engine) as session:
        stmt = (
            select(BorrowHistory, Users, books)
            .join(Users, Users.id == BorrowHistory.user_id)
            .join(books, books.id == BorrowHistory.book_id)
        )

        if user_id:
            stmt = stmt.where(BorrowHistory.user_id == user_id)

        rows = session.exec(stmt).all()

        events: List[ActivityRow] = []

        for (h, u, b) in rows:
            # BORROW
            if action in ("ALL", "BORROW"):
                d = h.borrowed_at
                if (not date_from or d >= date_from) and (not date_to or d <= date_to):
                    events.append(
                        ActivityRow(
                            date=d,
                            action="BORROW",
                            user_id=u.id,
                            firstname=u.firstname,
                            lastname=u.lastname,
                            book_id=b.id,
                            title=b.title,
                        )
                    )

            # RETURN
            if h.returned_at and action in ("ALL", "RETURN"):
                d = h.returned_at
                if (not date_from or d >= date_from) and (not date_to or d <= date_to):
                    events.append(
                        ActivityRow(
                            date=d,
                            action="RETURN",
                            user_id=u.id,
                            firstname=u.firstname,
                            lastname=u.lastname,
                            book_id=b.id,
                            title=b.title,
                        )
                    )

        events.sort(key=lambda x: x.date, reverse=True)
        return events[:limit]
