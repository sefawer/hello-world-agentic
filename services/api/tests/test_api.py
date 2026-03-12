import pytest
from httpx import AsyncClient
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.main import app

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