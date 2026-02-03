from sqlmodel import SQLModel, Field
from datetime import date
from enum import Enum
from typing import Optional


class UserGender(str, Enum):
    male = "זכר"
    female = "נקבה"
    other = "אחר"


class Users(SQLModel, table=True):
    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)

    firstname: str
    lastname: str
    birthdate: date
    address: str
    gender: UserGender
    email: str = Field(unique=True, index=True)
    hashedpass: str
    phonenumber: str = Field(unique=True, index=True)
    role: str = Field(default="user")
    image: Optional[str] = Field(default=None)
    is_blocked : bool = Field(default=False)
