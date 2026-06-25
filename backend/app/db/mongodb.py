from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

client: AsyncIOMotorClient = None
db = None


async def connect_db():
    global client, db
    client = AsyncIOMotorClient(
        settings.MONGO_URI,
        serverSelectionTimeoutMS=5000,   # fail fast if no MongoDB
        connectTimeoutMS=5000,
    )
    db = client[settings.MONGO_DB_NAME]
    # Ping to verify connection is alive
    try:
        await client.admin.command("ping")
        print(f"✅ Connected to MongoDB: {settings.MONGO_DB_NAME}")
    except Exception as e:
        print(f"❌ MongoDB connection failed: {e}")
        # Don't crash — routes will fail gracefully


async def close_db():
    global client
    if client:
        client.close()


def get_db():
    return db
