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
    if db is None:
        raise HTTPException(
            status_code=503,
            detail="Database not available. Please ensure MongoDB is running."
        )

    try:
        existing = await db.users.find_one({"email": data.email})
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"Database error: {str(e)}"
        )

    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = {
        "name": data.name,
        "email": data.email,
        "password_hash": hash_password(data.password),
        "role": "customer",
        "created_at": datetime.utcnow(),
    }

    try:
        result = await db.users.insert_one(user)
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"Could not create account: {str(e)}"
        )

    token = create_access_token({
        "sub": str(result.inserted_id),
        "role": "customer",
        "name": data.name,
    })
    return {"access_token": token}


@router.post("/login", response_model=Token)
async def login(data: UserLogin):
    db = get_db()
    if db is None:
        raise HTTPException(
            status_code=503,
            detail="Database not available. Please ensure MongoDB is running."
        )

    try:
        user = await db.users.find_one({"email": data.email})
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"Database error: {str(e)}"
        )

    if not user or not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({
        "sub": str(user["_id"]),
        "role": user["role"],
        "name": user.get("name", ""),
    })
    return {"access_token": token}
