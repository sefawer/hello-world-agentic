import pytest
import sys
import os
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy.pool import NullPool

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from src.main import app
from src.database import Base, get_db

# Test veritabanı URL'i (asyncpg ile)
TEST_DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://hello_user:hello_pass@localhost:5432/hello_db")

# Async engine oluştur
engine = create_async_engine(TEST_DATABASE_URL, poolclass=NullPool)
TestingSessionLocal = async_sessionmaker(engine, expire_on_commit=False)

async def override_get_db():
    async with TestingSessionLocal() as session:
        yield session

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(autouse=True)
async def setup_database():
    """Her testten önce tabloları oluştur ve temizle"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

@pytest.mark.asyncio
async def test_health():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "api"}

@pytest.mark.asyncio
async def test_get_messages():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.get("/api/messages?limit=5")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

@pytest.mark.asyncio
async def test_create_message():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post("/api/messages", json={"content": "Test Message"})
    assert response.status_code == 200
    data = response.json()
    assert data["content"] == "Test Message"
    assert "id" in data
    assert "timestamp" in data

@pytest.mark.asyncio
async def test_create_and_get():
    # Önce mesaj oluştur
    async with AsyncClient(app=app, base_url="http://test") as ac:
        await ac.post("/api/messages", json={"content": "First"})
        await ac.post("/api/messages", json={"content": "Second"})
    
        # Sonra mesajları getir
        response = await ac.get("/api/messages?limit=5")
        assert response.status_code == 200
        messages = response.json()
        assert len(messages) >= 2