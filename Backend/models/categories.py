
from sqlmodel import SQLModel,Field
from datetime import date,datetime
from enum import Enum



class categories(SQLModel, table =True):
    __tablename__='categories'
    id:int|None = Field(primary_key=True, default=None)
    name:str 