from __future__ import annotations

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import ScanUrlRecord, ScanFileRecord

router = APIRouter(prefix="/api/v1/history", tags=["history"])


class UrlHistoryItem(BaseModel):
    id: int
    created_at: str
    input_url: str
    normalized_url: str
    final_url: Optional[str]
    http_status: Optional[int]
    score: int
    level: str


class FileHistoryItem(BaseModel):
    id: int
    created_at: str
    filename: str
    size: int
    format: str
    score: int
    level: str


@router.get("/url", response_model=List[UrlHistoryItem])
def list_url_history(limit: int = 20, db: Session = Depends(get_db)) -> List[UrlHistoryItem]:
    q = (
        db.query(ScanUrlRecord)
        .order_by(ScanUrlRecord.created_at.desc())
        .limit(max(1, min(limit, 100)))
        .all()
    )
    return [
        UrlHistoryItem(
            id=r.id,
            created_at=r.created_at.isoformat(),
            input_url=r.input_url,
            normalized_url=r.normalized_url,
            final_url=r.final_url,
            http_status=r.http_status,
            score=r.score,
            level=r.level,
        )
        for r in q
    ]


@router.get("/file", response_model=List[FileHistoryItem])
def list_file_history(limit: int = 20, db: Session = Depends(get_db)) -> List[FileHistoryItem]:
    q = (
        db.query(ScanFileRecord)
        .order_by(ScanFileRecord.created_at.desc())
        .limit(max(1, min(limit, 100)))
        .all()
    )
    return [
        FileHistoryItem(
            id=r.id,
            created_at=r.created_at.isoformat(),
            filename=r.filename,
            size=r.size,
            format=r.format,
            score=r.score,
            level=r.level,
        )
        for r in q
    ]


# Detail endpoints return stored result_json
@router.get("/url/{id}")
def get_url_history_item(id: int, db: Session = Depends(get_db)):
    r = db.query(ScanUrlRecord).filter(ScanUrlRecord.id == id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Not found")
    return r.result_json


@router.get("/file/{id}")
def get_file_history_item(id: int, db: Session = Depends(get_db)):
    r = db.query(ScanFileRecord).filter(ScanFileRecord.id == id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Not found")
    return r.result_json
