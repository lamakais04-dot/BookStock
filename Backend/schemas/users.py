from pydantic import BaseModel
from datetime import date
from enum import Enum

class UserGender(str,Enum):
    male = "male"
    female = "female"
    other = "other"

class NewUser(BaseModel):
    firstname: str
    lastname: str
    birthdate: date
    address: str
    gender: UserGender
    email:str
    hashedpassword:str
    phonenumber:str
    imageurl:str | None = None
    libraryid:int | None = None


class UserUpdate(BaseModel):
    firstname: str| None = None
    lastname: str| None = None
    birthdate: date| None = None
    address: str| None = None
    gender: UserGender| None = None
    email:str| None = None
    phonenumber:str| None = None
    imageurl:str | None = None
    libraryid:int | None = None

