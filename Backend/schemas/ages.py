from pydantic import BaseModel


class Age(BaseModel):
    minage: int
    maxage: int
    description: str


class AgeUpdate(BaseModel):
    minage: int |None = None
    maxage: int |None = None
    description: str |None = None

