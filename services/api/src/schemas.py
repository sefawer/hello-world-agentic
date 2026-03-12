from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

class MessageBase(BaseModel):
    content: str = "Hello World"

class MessageCreate(MessageBase):
    pass

class MessageResponse(MessageBase):
    id: UUID
    content: str
    timestamp: datetime

    class Config:
        from_attributes = True

class HealthResponse(BaseModel):
    status: str = "ok"
    service: str = "api"