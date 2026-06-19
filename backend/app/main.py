from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, products, cart, orders, admin

app = FastAPI(title="Ecommerce API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,     prefix="/api/auth",     tags=["Auth"])
app.include_router(products.router, prefix="/api/products", tags=["Products"])
app.include_router(cart.router,     prefix="/api/cart",     tags=["Cart"])
app.include_router(orders.router,   prefix="/api/orders",   tags=["Orders"])
app.include_router(admin.router,    prefix="/api/admin",    tags=["Admin"])


@app.get("/health")
def health_check():
    return {"status": "ok"}
