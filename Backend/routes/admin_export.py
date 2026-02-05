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
from reportlab.lib.colors import HexColor

from bidi.algorithm import get_display
import arabic_reshaper

from utils.admin_helper import get_admin_user
from services.adminService import admin_activity_service

router = APIRouter(prefix="/admin/export", tags=["admin"])

# Register Hebrew / English font
pdfmetrics.registerFont(
    TTFont("DejaVu", "fonts/DejaVuSans.ttf")
)

# RTL helper (CORRECT – BiDi)
def rtl(text: str) -> str:
    reshaped = arabic_reshaper.reshape(text)
    return get_display(reshaped)

# EXCEL EXPORT (UNCHANGED)
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
            row.date.strftime('%Y-%m-%d'),
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

    filename = f"activity_{datetime.now().strftime('%Y-%m-%d')}.xlsx"
    return StreamingResponse(
        bio,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )

# PDF EXPORT (FIXED + STYLED)
@router.get("/activity.pdf", dependencies=[Depends(get_admin_user)])
def export_activity_pdf(
    action: str = "ALL",
    user_id: Optional[int] = None
):
    data = admin_activity_service(
        action=action,
        user_id=user_id,
        limit=500
    )

    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4

    margin_x = 40
    margin_y = 40
    y = height - margin_y

    # Colors
    title_color = HexColor("#2C3E50")
    text_color = HexColor("#2F2F2F")
    line_color = HexColor("#D0D0D0")

    # TITLE
    c.setFont("DejaVu", 18)
    c.setFillColor(title_color)
    c.drawRightString(
        width - margin_x,
        y,
        rtl("פעילות השאלה / החזרה")
    )

    y -= 22

    c.setFont("DejaVu", 10)
    c.setFillColor(text_color)
    c.drawRightString(
        width - margin_x,
        y,
        rtl(f"הופק בתאריך: {datetime.now().strftime('%Y-%m-%d')}")
    )

    y -= 18

    c.setStrokeColor(line_color)
    c.setLineWidth(1)
    c.line(margin_x, y, width - margin_x, y)

    y -= 24

    # CONTENT
    c.setFont("DejaVu", 10)
    c.setFillColor(text_color)

    for row in data:
        line = (
            f"{row.date.strftime('%Y-%m-%d')} | "
            f"{row.action} | "
            f"{row.firstname} {row.lastname} | "
            f"{row.title}"
        )

        c.drawRightString(
            width - margin_x,
            y,
            rtl(line)
        )

        y -= 16

        if y < margin_y + 20:
            c.showPage()
            c.setFont("DejaVu", 10)
            c.setFillColor(text_color)
            y = height - margin_y

    # FOOTER
    c.setFont("DejaVu", 9)
    c.setFillColor(HexColor("#7F8C8D"))
    c.drawCentredString(
        width / 2,
        20,
        rtl("BookStock • Admin Activity Report")
    )

    c.save()
    buffer.seek(0)

    filename = f"activity_{datetime.now().strftime('%Y-%m-%d')}.pdf"
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
