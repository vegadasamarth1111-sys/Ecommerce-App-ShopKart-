from fastapi import APIRouter, HTTPException, Query
from app.db.mongodb import get_db
from app.schemas.product import ProductOut
from bson import ObjectId
from typing import List, Optional

router = APIRouter()


def _serialize(p) -> dict:
    p["id"] = str(p["_id"])
    del p["_id"]
    return p


@router.get("/", response_model=List[ProductOut])
async def list_products(
    category_id: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    skip: int = 0,
    limit: int = 20,
):
    db = get_db()
    query = {}
    if category_id:
        query["category_id"] = category_id
    if search:
        query["name"] = {"$regex": search, "$options": "i"}

    cursor = db.products.find(query).skip(skip).limit(limit)
    return [_serialize(p) async for p in cursor]


@router.get("/{product_id}", response_model=ProductOut)
async def get_product(product_id: str):
    db = get_db()
    p = await db.products.find_one({"_id": ObjectId(product_id)})
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    return _serialize(p)
