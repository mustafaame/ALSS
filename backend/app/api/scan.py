from fastapi import APIRouter, HTTPException, UploadFile, File as FastAPIFile, Depends
from pydantic import BaseModel, Field
from typing import List, Optional
from urllib.parse import urlparse
import asyncio
import socket
import time
import httpx
from app.services.scoring import compute_threat_score
from app.services.intel import fetch_whois, fetch_ssl
from app.services.file_scoring import (
    compute_hashes,
    detect_format,
    analyze_zip,
    compute_file_threat_score,
)
from sqlalchemy.orm import Session
from app.db import get_db
from app.models import ScanUrlRecord, ScanFileRecord

router = APIRouter(prefix="/api/v1/scan", tags=["scan"])


class URLScanRequest(BaseModel):
    url: str


class HTTPInfo(BaseModel):
    status: Optional[int] = None
    reason: Optional[str] = None
    content_type: Optional[str] = None
    server: Optional[str] = None
    final_url: Optional[str] = None
    redirects: List[str] = Field(default_factory=list)
    elapsed_ms: Optional[int] = None
    
    class RedirectHop(BaseModel):
        url: str
        status: Optional[int] = None
    redirect_hops: List[RedirectHop] = Field(default_factory=list)


class DNSInfo(BaseModel):
    ips: List[str] = Field(default_factory=list)


class SSLInfo(BaseModel):
    subject: Optional[str] = None
    issuer: Optional[str] = None
    not_before: Optional[str] = None
    not_after: Optional[str] = None
    days_remaining: Optional[int] = None


class WHOISInfo(BaseModel):
    domain_name: Optional[str] = None
    registrar: Optional[str] = None
    creation_date: Optional[str] = None
    expiration_date: Optional[str] = None
    updated_date: Optional[str] = None
    country: Optional[str] = None


class URLScanResult(BaseModel):
    input_url: str
    normalized_url: str
    http: HTTPInfo
    dns: DNSInfo
    ok: bool
    error: Optional[str] = None
    score: int
    level: str
    factors: List[str]
    whois: WHOISInfo
    ssl: SSLInfo


def normalize_url(value: str) -> str:
    v = value.strip()
    if not v:
        return v
    p = urlparse(v)
    if not p.scheme:
        v = "http://" + v
    return v


async def resolve_ips(host: str) -> List[str]:
    def _resolve():
        infos = socket.getaddrinfo(host, None)
        ips: List[str] = []
        for info in infos:
            ip = info[4][0]
            if ip not in ips:
                ips.append(ip)
        return ips

    try:
        return await asyncio.to_thread(_resolve)
    except Exception:
        return []


async def fetch_http(url: str) -> HTTPInfo:
    headers = {"User-Agent": "ALSS/0.1"}
    limits = httpx.Limits(max_keepalive_connections=5, max_connections=10)
    timeout = httpx.Timeout(10.0, connect=10.0, read=10.0)
    t0 = time.monotonic()
    try:
        async with httpx.AsyncClient(
            follow_redirects=True, headers=headers, limits=limits, timeout=timeout
        ) as client:
            resp = await client.get(url)
        elapsed_ms = int((time.monotonic() - t0) * 1000)
        redirects = [str(r.url) for r in resp.history]
        redirect_hops = [HTTPInfo.RedirectHop(url=str(r.url), status=r.status_code) for r in resp.history]
        content_type = resp.headers.get("content-type")
        server = resp.headers.get("server")
        return HTTPInfo(
            status=resp.status_code,
            reason=resp.reason_phrase,
            content_type=content_type,
            server=server,
            final_url=str(resp.url),
            redirects=redirects,
            redirect_hops=redirect_hops,
            elapsed_ms=elapsed_ms,
        )
    except Exception:
        elapsed_ms = int((time.monotonic() - t0) * 1000)
        return HTTPInfo(
            status=None,
            reason=None,
            content_type=None,
            server=None,
            final_url=None,
            redirects=[],
            redirect_hops=[],
            elapsed_ms=elapsed_ms,
        )


@router.post("/url", response_model=URLScanResult)
async def scan_url(payload: URLScanRequest, db: Session = Depends(get_db)) -> URLScanResult:
    input_url = payload.url
    normalized = normalize_url(input_url)
    if not normalized:
        raise HTTPException(status_code=422, detail="Empty URL")
    try:
        host = urlparse(normalized).hostname or ""
    except Exception:
        raise HTTPException(status_code=422, detail="Invalid URL")
    dns_ips = await resolve_ips(host) if host else []
    http_info = await fetch_http(normalized)
    ok = http_info.status is not None
    error = None if ok else "request_failed"
    score, level, factors = compute_threat_score(
        input_url=input_url,
        final_url=http_info.final_url or normalized,
        http=http_info.dict(),
        dns_ips=dns_ips,
    )
    whois_data = fetch_whois(host) if host else {}
    ssl_data = fetch_ssl(host) if host else {}
    result = URLScanResult(
        input_url=input_url,
        normalized_url=normalized,
        http=http_info,
        dns=DNSInfo(ips=dns_ips),
        ok=ok,
        error=error,
        score=score,
        level=level,
        factors=factors,
        whois=WHOISInfo(**whois_data),
        ssl=SSLInfo(**ssl_data),
    )

    # persist
    try:
        rec = ScanUrlRecord(
            input_url=input_url,
            normalized_url=normalized,
            final_url=http_info.final_url,
            http_status=http_info.status,
            score=score,
            level=level,
            result_json=result.dict(),
        )
        db.add(rec)
        db.commit()
    except Exception:
        db.rollback()

    return result

# ---- File scanning response models ----
class FileHashes(BaseModel):
    md5: str
    sha1: str
    sha256: str


class ZipInfo(BaseModel):
    entries: Optional[List[str]] = None
    has_vba: Optional[bool] = None
    double_ext_entries: Optional[List[str]] = None


class FileScanResult(BaseModel):
    filename: str
    size: int
    content_type: Optional[str] = None
    format: str
    hashes: FileHashes
    zip: ZipInfo
    score: int
    level: str
    factors: List[str]
    ok: bool
    error: Optional[str] = None


@router.post("/file", response_model=FileScanResult)
async def scan_file(file: UploadFile = FastAPIFile(...), db: Session = Depends(get_db)) -> FileScanResult:
    try:
        data = await file.read()
    except Exception:
        raise HTTPException(status_code=400, detail="Failed to read file")
    if not data:
        raise HTTPException(status_code=422, detail="Empty file")

    size = len(data)
    filename = file.filename or "uploaded.bin"
    content_type = file.content_type
    fmt = detect_format(data[:8])
    hashes = compute_hashes(data)
    zip_meta = analyze_zip(data) if fmt == "zip" else {"entries": None, "has_vba": None, "double_ext_entries": None}
    score, level, factors = compute_file_threat_score(
        filename=filename,
        size=size,
        content_type=content_type,
        fmt=fmt,
        data=data,
        zip_info=zip_meta,
    )
    result = FileScanResult(
        filename=filename,
        size=size,
        content_type=content_type,
        format=fmt,
        hashes=FileHashes(**hashes),
        zip=ZipInfo(**zip_meta),
        score=score,
        level=level,
        factors=factors,
        ok=True,
        error=None,
    )

    # persist
    try:
        rec = ScanFileRecord(
            filename=filename,
            size=size,
            format=fmt,
            score=score,
            level=level,
            result_json=result.dict(),
        )
        db.add(rec)
        db.commit()
    except Exception:
        db.rollback()

    return result
