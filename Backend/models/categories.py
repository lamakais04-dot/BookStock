
from sqlmodel import SQLModel,Field



class categories(SQLModel, table =True):
    __tablename__='categories'
    id:int|None = Field(primary_key=True, default=None)
    name:str 