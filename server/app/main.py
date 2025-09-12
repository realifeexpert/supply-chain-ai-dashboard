from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine
from .models import models
# --- CHANGE 1: Naye 'ai' module ko import karein ---
from .api import analytics, inventory, orders, logistics, users, ai

# App shuru hone par saare database tables create karein
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Supply Chain AI Dashboard API")

# CORS (Cross-Origin Resource Sharing)
# Yeh hamare React frontend ko backend se communicate karne ki anumati dega
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # Hamare frontend app ka address
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Sabhi API routers mein "/api" prefix wapas add kiya gaya hai ---
# Yeh ek standard tareeka hai API routes ko group karne ka.
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(inventory.router, prefix="/api/inventory", tags=["Inventory"])
app.include_router(orders.router, prefix="/api/orders", tags=["Orders"])
app.include_router(logistics.router, prefix="/api/logistics", tags=["Logistics"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
# --- CHANGE 2: Naye 'ai' router ko app mein include karein ---
app.include_router(ai.router, prefix="/api/ai", tags=["AI"])


@app.get("/")
def read_root():
    return {"message": "Welcome to the Supply Chain AI Dashboard API!"}