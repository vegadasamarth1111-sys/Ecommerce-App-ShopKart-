from fastapi import APIRouter, HTTPException, status
from app.schemas.user import UserRegister, UserLogin, Token
from app.core.security import hash_password, verify_password, create_access_token
from app.db.mongodb import get_db
from bson import ObjectId
from datetime import datetime

router = APIRouter()


@router.post("/register", response_model=Token)
async def register(data: UserRegister):
    db = get_db()
    existing = await db.users.find_one({"email": data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = {
        "name": data.name,
        "email": data.email,
        "password_hash": hash_password(data.password),
        "role": "customer",
        "created_at": datetime.utcnow(),
    }
    result = await db.users.insert_one(user)
    token = create_access_token({"sub": str(result.inserted_id), "role": "customer"})
    return {"access_token": token}


@router.post("/login", response_model=Token)
async def login(data: UserLogin):
    db = get_db()
    user = await db.users.find_one({"email": data.email})
    if not user or not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": str(user["_id"]), "role": user["role"]})
    return {"access_token": token}
