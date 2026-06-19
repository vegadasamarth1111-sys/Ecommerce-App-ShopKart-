from fastapi import APIRouter, Depends, HTTPException
from app.db.mongodb import get_db
from app.deps import get_current_user
from bson import ObjectId

router = APIRouter()


@router.get("/")
async def get_cart(user=Depends(get_current_user)):
    db = get_db()
    cart = await db.carts.find_one({"user_id": user["sub"]})
    if not cart:
        return {"items": []}
    # enrich with product details
    enriched = []
    for item in cart.get("items", []):
        p = await db.products.find_one({"_id": ObjectId(item["product_id"])})
        if p:
            enriched.append({
                "product_id": item["product_id"],
                "name": p["name"],
                "price": p["price"],
                "image_url": p.get("image_url", ""),
                "quantity": item["quantity"],
            })
    return {"items": enriched}


@router.post("/add")
async def add_to_cart(product_id: str, quantity: int = 1, user=Depends(get_current_user)):
    db = get_db()
    p = await db.products.find_one({"_id": ObjectId(product_id)})
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")

    cart = await db.carts.find_one({"user_id": user["sub"]})
    if not cart:
        await db.carts.insert_one({"user_id": user["sub"], "items": [{"product_id": product_id, "quantity": quantity}]})
    else:
        items = cart["items"]
        for item in items:
            if item["product_id"] == product_id:
                item["quantity"] += quantity
                break
        else:
            items.append({"product_id": product_id, "quantity": quantity})
        await db.carts.update_one({"user_id": user["sub"]}, {"$set": {"items": items}})

    return {"message": "Added to cart"}


@router.delete("/remove/{product_id}")
async def remove_from_cart(product_id: str, user=Depends(get_current_user)):
    db = get_db()
    await db.carts.update_one(
        {"user_id": user["sub"]},
        {"$pull": {"items": {"product_id": product_id}}}
    )
    return {"message": "Removed from cart"}


@router.put("/update/{product_id}")
async def update_quantity(product_id: str, quantity: int, user=Depends(get_current_user)):
    db = get_db()
    if quantity <= 0:
        await db.carts.update_one(
            {"user_id": user["sub"]},
            {"$pull": {"items": {"product_id": product_id}}}
        )
    else:
        await db.carts.update_one(
            {"user_id": user["sub"], "items.product_id": product_id},
            {"$set": {"items.$.quantity": quantity}}
        )
    return {"message": "Cart updated"}
