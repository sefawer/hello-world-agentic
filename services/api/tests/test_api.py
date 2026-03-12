import pytest
from fastapi.testclient import TestClient
import sys
import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from src.main import app
from src.database import Base, get_db
from src.models import Message

# Test veritabanı URL'i (asyncpg ile)
TEST_DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://hello_user:hello_pass@localhost:5432/hello_db")

# Async engine oluştur
engine = create_async_engine(TEST_DATABASE_URL, poolclass=NullPool)
TestingSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def override_get_db():
    async with TestingSessionLocal() as session:
        yield session

app.dependency_overrides[get_db] = override_get_db

# Test client (sync)
client = TestClient(app)

@pytest.fixture(autouse=True)
async def setup_database():
    """Her testten önce tabloları oluştur"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

@pytest.mark.asyncio
async def test_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "api"}

@pytest.mark.asyncio
async def test_get_messages():
    response = client.get("/api/messages?limit=5")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

@pytest.mark.asyncio
async def test_create_message():
    response = client.post("/api/messages", json={"content": "Test Message"})
    assert response.status_code == 200
    data = response.json()
    assert data["content"] == "Test Message"
    assert "id" in data
    assert "timestamp" in data