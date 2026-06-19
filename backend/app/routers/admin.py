from fastapi import APIRouter, Depends, HTTPException
from app.db.mongodb import get_db
from app.deps import get_admin_user
from app.schemas.product import ProductCreate, ProductUpdate, ProductOut
from bson import ObjectId
from datetime import datetime

router = APIRouter()


def _s(p):
    p["id"] = str(p["_id"])
    del p["_id"]
    return p


# ── Products ──────────────────────────────────────────────────────────────────

@router.post("/products", response_model=dict)
async def create_product(data: ProductCreate, admin=Depends(get_admin_user)):
    db = get_db()
    doc = data.dict()
    doc["created_at"] = datetime.utcnow()
    result = await db.products.insert_one(doc)
    return {"id": str(result.inserted_id)}


@router.put("/products/{product_id}")
async def update_product(product_id: str, data: ProductUpdate, admin=Depends(get_admin_user)):
    db = get_db()
    update = {k: v for k, v in data.dict().items() if v is not None}
    await db.products.update_one({"_id": ObjectId(product_id)}, {"$set": update})
    return {"message": "Updated"}


@router.delete("/products/{product_id}")
async def delete_product(product_id: str, admin=Depends(get_admin_user)):
    db = get_db()
    await db.products.delete_one({"_id": ObjectId(product_id)})
    return {"message": "Deleted"}


# ── Categories ────────────────────────────────────────────────────────────────

@router.post("/categories")
async def create_category(name: str, slug: str, admin=Depends(get_admin_user)):
    db = get_db()
    result = await db.categories.insert_one({"name": name, "slug": slug})
    return {"id": str(result.inserted_id)}


@router.get("/categories")
async def list_categories(admin=Depends(get_admin_user)):
    db = get_db()
    cats = []
    async for c in db.categories.find():
        c["id"] = str(c["_id"])
        del c["_id"]
        cats.append(c)
    return cats


# ── Orders ────────────────────────────────────────────────────────────────────

@router.get("/orders")
async def list_all_orders(admin=Depends(get_admin_user)):
    db = get_db()
    orders = []
    async for o in db.orders.find().sort("created_at", -1):
        o["id"] = str(o["_id"])
        del o["_id"]
        o["created_at"] = str(o["created_at"])
        orders.append(o)
    return orders


@router.put("/orders/{order_id}/status")
async def update_order_status(order_id: str, status: str, admin=Depends(get_admin_user)):
    db = get_db()
    await db.orders.update_one({"_id": ObjectId(order_id)}, {"$set": {"status": status}})
    return {"message": f"Order status updated to {status}"}


# ── Stats ─────────────────────────────────────────────────────────────────────

@router.get("/stats")
async def dashboard_stats(admin=Depends(get_admin_user)):
    db = get_db()
    total_orders = await db.orders.count_documents({})
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today_orders = await db.orders.count_documents({"created_at": {"$gte": today_start}})
    pipeline = [{"$group": {"_id": None, "total": {"$sum": "$total_amount"}}}]
    rev_result = await db.orders.aggregate(pipeline).to_list(1)
    total_revenue = rev_result[0]["total"] if rev_result else 0
    total_products = await db.products.count_documents({})
    return {
        "total_orders": total_orders,
        "today_orders": today_orders,
        "total_revenue": round(total_revenue, 2),
        "total_products": total_products,
    }
