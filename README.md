# 🛒 ShopKart — Ecommerce App

A simplified Amazon/Flipkart-style storefront built for internship Week 2.

## Stack
| Layer      | Tech                          |
|------------|-------------------------------|
| Frontend   | Next.js 14 + React 18 + Bootstrap 5 |
| Backend    | Python 3.11 + FastAPI         |
| Database   | MongoDB (via Motor async)     |
| Auth       | JWT (python-jose + bcrypt)    |

---

## Quick Start

### 1. Backend
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env        # then edit JWT_SECRET
uvicorn app.main:app --reload
# API → http://localhost:8000
# Swagger docs → http://localhost:8000/docs
```

### 2. Frontend
```powershell
cd frontend
npm install
npm run dev
# App → http://localhost:3000
```

---

## Folder Structure
```
ecommerce-app/
├── backend/
│   ├── app/
│   │   ├── core/        # config.py, security.py
│   │   ├── db/          # mongodb.py (Motor client)
│   │   ├── models/      # Mongo collection shapes
│   │   ├── schemas/     # Pydantic request/response models
│   │   ├── routers/     # auth, products, cart, orders, admin
│   │   ├── deps.py      # get_current_user, get_admin_user
│   │   └── main.py      # FastAPI entrypoint + CORS
│   └── requirements.txt
└── frontend/
    ├── pages/
    │   ├── index.js         # Home
    │   ├── login.js
    │   ├── register.js
    │   ├── cart.js
    │   ├── checkout.js
    │   ├── products/        # Listing + Detail
    │   └── admin/           # Dashboard + Products + Orders
    ├── components/          # Navbar, ProductCard, CartItem, AdminSidebar
    ├── lib/api.js           # Axios instance with JWT interceptor
    └── styles/globals.css   # Design system (CSS variables, cards, etc.)
```

---

## Creating an Admin User
Register normally, then in MongoDB shell:
```js
use ecommerce
db.users.updateOne({ email: "admin@example.com" }, { $set: { role: "admin" } })
```
