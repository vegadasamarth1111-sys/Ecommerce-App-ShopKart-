from pydantic import BaseModel
from typing import List


class ShippingAddress(BaseModel):
    full_name: str
    address_line: str
    city: str
    state: str
    pincode: str
    phone: str


class OrderItemOut(BaseModel):
    product_id: str
    product_name: str
    quantity: int
    price_at_purchase: float


class OrderCreate(BaseModel):
    shipping_address: ShippingAddress


class OrderOut(BaseModel):
    id: str
    user_id: str
    items: List[OrderItemOut]
    total_amount: float
    status: str
    shipping_address: ShippingAddress
    created_at: str
