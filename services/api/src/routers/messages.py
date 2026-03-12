from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
import httpx
import os
from datetime import datetime

from .. import schemas, models
from ..database import get_db

router = APIRouter(prefix="/api", tags=["messages"])

WEBSOCKET_URL = os.getenv("WEBSOCKET_URL", "http://websocket:8001")

@router.post("/messages", response_model=schemas.MessageResponse)
async def create_message(
    request: Request,
    message: schemas.MessageCreate,
    db: AsyncSession = Depends(get_db)
):
    # Client IP'yi al
    client_ip = request.client.host if request.client else "unknown"
    
    # Veritabanına kaydet
    db_message = models.Message(
        content=message.content,
        sender_ip=client_ip
    )
    db.add(db_message)
    await db.commit()
    await db.refresh(db_message)
    
    # WebSocket servisine bildir
    try:
        async with httpx.AsyncClient() as client:
            await client.post(
                f"{WEBSOCKET_URL}/api/broadcast",
                json={
                    "content": db_message.content,
                    "timestamp": db_message.timestamp.isoformat()
                },
                timeout=5.0
            )
    except Exception as e:
        print(f"WebSocket bildirimi başarısız: {e}")
    
    return db_message

@router.get("/messages", response_model=list[schemas.MessageResponse])
async def get_messages(
    limit: int = 10,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(models.Message)
        .order_by(desc(models.Message.timestamp))
        .limit(limit)
    )
    messages = result.scalars().all()
    return messages