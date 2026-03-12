from sqlalchemy import Column, String, DateTime, UUID
from sqlalchemy.sql import func
import uuid
from .database import Base

class Message(Base):
    __tablename__ = "messages"

    id = Column(UUID, primary_key=True, default=uuid.uuid4)
    content = Column(String(255), nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    sender_ip = Column(String, nullable=True)