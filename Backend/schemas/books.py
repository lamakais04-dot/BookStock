from pydantic import BaseModel, Field


class BookCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    summary: str = Field(min_length=1)
    author: str = Field(min_length=1, max_length=255)
    quantity: int = Field(ge=0)
    pages: int = Field(gt=0)
    categoryid: int = Field(gt=0)
    agesid: int = Field(gt=0)


class BookUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    summary: str | None = Field(default=None, min_length=1)
    author: str | None = Field(default=None, min_length=1, max_length=255)
    quantity: int | None = Field(default=None, ge=0)
    pages: int | None = Field(default=None, gt=0)
    categoryid: int | None = Field(default=None, gt=0)
    agesid: int | None = Field(default=None, gt=0)
