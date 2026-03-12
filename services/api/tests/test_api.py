import pytest
from fastapi.testclient import TestClient
import sys
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from src.main import app
from src.database import Base, get_db
from src.models import Message

# Test veritabanı URL'i (CI'da postgres service'den geliyor)
TEST_DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://hello_user:hello_pass@localhost:5432/hello_db")

# Test engine'i oluştur
engine = create_engine(TEST_DATABASE_URL.replace("+asyncpg", ""))
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_database():
    """Her testten önce tabloları oluştur"""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

def test_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "api"}

def test_get_messages():
    response = client.get("/api/messages?limit=5")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_create_message():
    response = client.post("/api/messages", json={"content": "Test Message"})
    assert response.status_code == 200
    data = response.json()
    assert data["content"] == "Test Message"
    assert "id" in data
    assert "timestamp" in data

def test_get_messages_after_create():
    # Önce mesaj oluştur
    client.post("/api/messages", json={"content": "First Message"})
    client.post("/api/messages", json={"content": "Second Message"})
    
    # Sonra mesajları getir
    response = client.get("/api/messages?limit=5")
    assert response.status_code == 200
    messages = response.json()
    assert len(messages) >= 2
    assert messages[0]["content"] in ["First Message", "Second Message"]