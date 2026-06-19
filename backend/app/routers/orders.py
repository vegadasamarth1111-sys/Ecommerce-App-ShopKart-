from fastapi import APIRouter, Depends, HTTPException
from app.db.mongodb import get_db
from app.deps import get_current_user
from app.schemas.order import OrderCreate, OrderOut
from bson import ObjectId
from datetime import datetime
from typing import List

router = APIRouter()


@router.post("/", response_model=dict)
async def place_order(data: OrderCreate, user=Depends(get_current_user)):
    db = get_db()
    cart = await db.carts.find_one({"user_id": user["sub"]})
    if not cart or not cart.get("items"):
        raise HTTPException(status_code=400, detail="Cart is empty")

    order_items = []
    total = 0.0
    for item in cart["items"]:
        p = await db.products.find_one({"_id": ObjectId(item["product_id"])})
        if not p:
            continue
        subtotal = p["price"] * item["quantity"]
        total += subtotal
        order_items.append({
            "product_id": item["product_id"],
            "product_name": p["name"],
            "quantity": item["quantity"],
            "price_at_purchase": p["price"],
        })

    order = {
        "user_id": user["sub"],
        "items": order_items,
        "total_amount": round(total, 2),
        "status": "pending",
        "shipping_address": data.shipping_address.dict(),
        "created_at": datetime.utcnow(),
    }
    result = await db.orders.insert_one(order)
    await db.carts.delete_one({"user_id": user["sub"]})

    return {"message": "Order placed", "order_id": str(result.inserted_id)}


@router.get("/my")
async def my_orders(user=Depends(get_current_user)):
    db = get_db()
    cursor = db.orders.find({"user_id": user["sub"]}).sort("created_at", -1)
    orders = []
    async for o in cursor:
        o["id"] = str(o["_id"])
        del o["_id"]
        o["created_at"] = str(o["created_at"])
        orders.append(o)
    return orders
