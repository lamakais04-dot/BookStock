from sqlmodel import SQLModel,Field
from datetime import date
from enum import Enum

class UserGender(Enum):
    male = "male"
    female = "female"
    other = "other"

class Users(SQLModel,table = True):
    __tablename__ = 'users'
    id: int|None = Field(primary_key=True , default=None)
    firstname: str
    lastname: str
    birthdate: date
    address: str
    gender: UserGender
    email:str = Field(unique=True)
    hashedpassword:str
    phonenumber:str = Field(unique=True)
    role:str = "user"
    imageurl:str | None = None
    libraryid:int

 