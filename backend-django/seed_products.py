"""
Run: python seed_products.py
Seeds the DB with sample categories and products.
"""
import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "ecommerce.settings")
django.setup()

from apps.products.models import Category, Product

# ── Categories ────────────────────────────────────────────────────────────────
CATEGORIES = [
    {"name": "Electronics",   "description": "Gadgets, devices and accessories"},
    {"name": "Fashion",        "description": "Clothing, shoes and accessories"},
    {"name": "Home & Kitchen", "description": "Home decor and kitchen essentials"},
    {"name": "Books",          "description": "Bestsellers, textbooks and more"},
    {"name": "Sports",         "description": "Fitness gear and outdoor equipment"},
    {"name": "Beauty",         "description": "Skincare, makeup and wellness"},
]

cat_map = {}
for c in CATEGORIES:
    obj, _ = Category.objects.get_or_create(name=c["name"], defaults={"description": c["description"]})
    cat_map[c["name"]] = obj
    print(f"  Category: {obj.name}")

# ── Products ──────────────────────────────────────────────────────────────────
PRODUCTS = [
    # Electronics
    dict(name="Sony WH-1000XM5 Headphones",  category="Electronics", price=24990, compare_price=32990, stock_qty=40,
         description="Industry-leading noise cancellation with 30-hour battery life and multipoint connection."),
    dict(name="Apple AirPods Pro (2nd Gen)", category="Electronics", price=19900, compare_price=26900, stock_qty=55,
         description="Active Noise Cancellation, Adaptive Transparency, and Personalized Spatial Audio."),
    dict(name="Samsung 65\" 4K QLED TV",     category="Electronics", price=89990, compare_price=109990, stock_qty=15,
         description="Quantum Dot technology delivers 100% color volume with the Quantum Processor 4K."),
    dict(name="boAt Airdopes 141",            category="Electronics", price=1299,  compare_price=2990,  stock_qty=200,
         description="42-hour playtime, Beast™ Mode for gaming, and IPX4 water resistance."),
    dict(name="Logitech MX Master 3S Mouse", category="Electronics", price=7495,  compare_price=9995,  stock_qty=80,
         description="8000 DPI, MagSpeed electromagnetic scroll wheel, whisper-quiet clicks."),
    dict(name="Mechanical Keyboard TKL",      category="Electronics", price=4999,  compare_price=6999,  stock_qty=60,
         description="Tenkeyless layout, RGB backlit, blue switches — perfect for coders and gamers."),

    # Fashion
    dict(name="Levi's 511 Slim Fit Jeans",   category="Fashion", price=3499, compare_price=4999, stock_qty=120,
         description="Classic slim fit in premium stretch denim. Available in multiple washes."),
    dict(name="Nike Air Max 270",             category="Fashion", price=8995, compare_price=10995, stock_qty=90,
         description="Max Air unit in the heel for all-day comfort. Breathable mesh upper."),
    dict(name="Allen Solly Formal Shirt",     category="Fashion", price=1299, compare_price=1999, stock_qty=150,
         description="Regular fit cotton blend shirt, wrinkle-resistant, perfect for office wear."),
    dict(name="Wildcraft Backpack 30L",       category="Fashion", price=1999, compare_price=2999, stock_qty=70,
         description="Water-resistant 30L backpack with laptop sleeve and ergonomic straps."),

    # Home & Kitchen
    dict(name="Instant Pot Duo 7-in-1",      category="Home & Kitchen", price=7999, compare_price=10999, stock_qty=35,
         description="Pressure cooker, slow cooker, rice cooker, steamer, sauté, yogurt maker and warmer."),
    dict(name="Philips Air Fryer HD9200",     category="Home & Kitchen", price=5499, compare_price=7999, stock_qty=45,
         description="Rapid Air technology for up to 90% less fat. 4L capacity, 1400W."),
    dict(name="Milton Thermosteel Flask 1L",  category="Home & Kitchen", price=799,  compare_price=1299, stock_qty=300,
         description="Double wall stainless steel keeps beverages hot 24 hrs, cold 48 hrs."),
    dict(name="Solimo Non-Stick Cookware Set",category="Home & Kitchen", price=2499, compare_price=3999, stock_qty=60,
         description="5-piece set with PFOA-free coating. Dishwasher safe, induction compatible."),

    # Books
    dict(name="Atomic Habits — James Clear",  category="Books", price=349, compare_price=499, stock_qty=500,
         description="Build good habits and break bad ones with proven frameworks backed by science."),
    dict(name="The Psychology of Money",       category="Books", price=299, compare_price=450, stock_qty=400,
         description="Timeless lessons on wealth, greed, and happiness by Morgan Housel."),
    dict(name="Deep Work — Cal Newport",       category="Books", price=329, compare_price=499, stock_qty=350,
         description="Rules for focused success in a distracted world."),
    dict(name="Zero to One — Peter Thiel",     category="Books", price=279, compare_price=399, stock_qty=300,
         description="Notes on startups, or how to build the future."),

    # Sports
    dict(name="Boldfit Gym Gloves",            category="Sports", price=349,  compare_price=699,  stock_qty=250,
         description="Anti-slip padding, breathable mesh back, adjustable wrist wrap."),
    dict(name="Cosco Hi-Speed Badminton Set",  category="Sports", price=1299, compare_price=1999, stock_qty=80,
         description="2 rackets, 3 shuttlecocks, carrying bag. Great for casual and club play."),
    dict(name="Decathlon Resistance Bands Set",category="Sports", price=699,  compare_price=999,  stock_qty=180,
         description="5-band set (10–50 lb). Latex-free, stackable up to 150 lb resistance."),
    dict(name="Nivia Marathon Running Shoes",  category="Sports", price=2499, compare_price=3999, stock_qty=100,
         description="Lightweight mesh upper, EVA midsole cushioning, anti-skid rubber outsole."),

    # Beauty
    dict(name="Minimalist 10% Niacinamide Serum", category="Beauty", price=599, compare_price=899, stock_qty=200,
         description="Reduces acne, controls oil and visibly minimises pores. Dermatologist tested."),
    dict(name="Lakme Sun Expert SPF 50 PA+++", category="Beauty", price=349, compare_price=549, stock_qty=300,
         description="Ultra matte finish, non-greasy, protects against UVA & UVB rays."),
    dict(name="Biotique Bio Honey Gel Face Wash",category="Beauty", price=199, compare_price=299, stock_qty=400,
         description="Gentle daily cleanser with honey and botanical extracts for all skin types."),
    dict(name="Mamaearth Vitamin C Face Cream", category="Beauty", price=449, compare_price=699, stock_qty=250,
         description="Brightens, hydrates, and protects. Enriched with Vitamin C & turmeric."),
]

created = 0
for p in PRODUCTS:
    cat = cat_map.get(p.pop("category"))
    obj, new = Product.objects.get_or_create(name=p["name"], defaults={**p, "category": cat})
    if new:
        created += 1
    print(f"  {'[NEW]' if new else '[EXISTS]'} {obj.name} - Rs.{obj.price}")

print(f"\n✅ Done! {created} products created, {len(PRODUCTS) - created} already existed.")
