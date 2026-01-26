from sqlmodel import SQLModel,Field
from datetime import date
from enum import Enum

class UserGender(str, Enum):
    male = "זכר"
    female = "נקבה"
    other = "אחר"

class Users(SQLModel,table = True):
    __tablename__ = 'users'
    id: int|None = Field(primary_key=True , default=None)
    firstname: str
    lastname: str
    birthdate: date
    address: str
    gender: UserGender
    email:str = Field(unique=True)
    hashedpass:str
    phonenumber:str = Field(unique=True)
    role:str = "user"
    image:str | None = None

 