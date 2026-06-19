from pydantic import BaseModel
from typing import Optional


class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    stock_qty: int
    category_id: str
    image_url: Optional[str] = ""


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    stock_qty: Optional[int] = None
    category_id: Optional[str] = None
    image_url: Optional[str] = None


class ProductOut(BaseModel):
    id: str
    name: str
    description: str
    price: float
    stock_qty: int
    category_id: str
    image_url: str
