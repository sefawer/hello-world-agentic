from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import messages
from .database import engine, Base
import os

app = FastAPI(title="Hello World API", version="1.0.0")

# CORS ayarları
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(messages.router)

@app.get("/")
async def root():
    return {"message": "Hello World API"}

@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "api"}

@app.on_event("startup")
async def startup():
    # Tabloları oluştur (development için)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)