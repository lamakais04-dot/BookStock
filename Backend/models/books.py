from sqlmodel import SQLModel,Field


class books(SQLModel, table =True):
    __tablename__='books'
    id:int|None = Field(primary_key=True, default=None)
    categoryid:int
    title:str
    summary:str
    image:str | None = None
    quantity: int 
    pages: int
    agesid: int
    author: str
