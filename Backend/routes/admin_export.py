from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from typing import Optional
from datetime import datetime
from io import BytesIO

from openpyxl import Workbook

from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

from utils.admin_helper import get_admin_user
from services.adminService import admin_activity_service

router = APIRouter(prefix="/admin/export", tags=["admin"])


# =========================
# Register Hebrew font
# =========================
pdfmetrics.registerFont(
    TTFont("DejaVu", "fonts/DejaVuSans.ttf")
)


def rtl(text: str) -> str:
    """Simple RTL fix for Hebrew text"""
    return text[::-1]


# =========================
# EXCEL EXPORT
# =========================
@router.get("/activity.xlsx", dependencies=[Depends(get_admin_user)])
def export_activity_excel(
    user_id: Optional[int] = None,
    action: str = "ALL",
):
    data = admin_activity_service(user_id=user_id, action=action, limit=100000)

    wb = Workbook()
    ws = wb.active
    ws.title = "Activity"

    ws.append([
        "Date",
        "Action",
        "User ID",
        "First Name",
        "Last Name",
        "Book ID",
        "Title",
    ])

    for row in data:
        ws.append([
            row.date.strftime("%Y-%m-%d %H:%M"),
            row.action,
            row.user_id,
            row.firstname,
            row.lastname,
            row.book_id,
            row.title,
        ])

    bio = BytesIO()
    wb.save(bio)
    bio.seek(0)

    filename = f"activity_{datetime.now().strftime('%Y%m%d_%H%M')}.xlsx"
    return StreamingResponse(
        bio,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


# =========================
# PDF EXPORT (HEBREW FIXED)
# =========================
@router.get("/activity.pdf", dependencies=[Depends(get_admin_user)])
def export_activity_pdf(action: str = "ALL"):
    data = admin_activity_service(action=action, limit=500)

    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4

    y = height - 40

    # Title
    c.setFont("DejaVu", 16)
    c.drawRightString(550, y, rtl("פעילות השאלה / החזרה"))
    y -= 40

    c.setFont("DejaVu", 10)

    for row in data:
        line = (
            f"{row.date.strftime('%Y-%m-%d %H:%M')} | "
            f"{row.action} | "
            f"{row.firstname} {row.lastname} | "
            f"{row.title}"
        )

        c.drawRightString(550, y, rtl(line))
        y -= 16

        if y < 40:
            c.showPage()
            c.setFont("DejaVu", 10)
            y = height - 40

    c.save()
    buffer.seek(0)

    filename = f"activity_{datetime.now().strftime('%Y%m%d_%H%M')}.pdf"
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
