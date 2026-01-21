from sqlmodel import SQLModel,Field


class Ages(SQLModel,table = True):
    __tablename__ = 'ages'
    id: int|None = Field(primary_key=True , default=None)
    minage: int
    maxage: int
    description: str

 