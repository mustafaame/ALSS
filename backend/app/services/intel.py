from typing import Any, Dict, Optional
from urllib.parse import urlparse
import socket
import ssl
from datetime import datetime, timezone

import whois


def _host_only(host: str) -> str:
    return host.split(":", 1)[0] if host else ""


def _to_iso(value: Any) -> Optional[str]:
    if value is None:
        return None
    if isinstance(value, list) and value:
        value = value[0]
    if isinstance(value, datetime):
        if value.tzinfo is None:
            value = value.replace(tzinfo=timezone.utc)
        return value.isoformat()
    try:
        return str(value)
    except Exception:
        return None


def fetch_whois(host: str) -> Dict[str, Optional[str]]:
    h = _host_only(host)
    try:
        data = whois.whois(h)
        return {
            "domain_name": _to_iso(data.get("domain_name")),
            "registrar": _to_iso(data.get("registrar")),
            "creation_date": _to_iso(data.get("creation_date")),
            "expiration_date": _to_iso(data.get("expiration_date")),
            "updated_date": _to_iso(data.get("updated_date")),
            "country": _to_iso(data.get("country")),
        }
    except Exception:
        return {
            "domain_name": None,
            "registrar": None,
            "creation_date": None,
            "expiration_date": None,
            "updated_date": None,
            "country": None,
        }


def _parse_ssl_time(value: str) -> Optional[datetime]:
    try:
        return datetime.strptime(value, "%b %d %H:%M:%S %Y GMT").replace(tzinfo=timezone.utc)
    except Exception:
        return None


def fetch_ssl(host: str, port: int = 443) -> Dict[str, Optional[str]]:
    h = _host_only(host)
    try:
        ctx = ssl.create_default_context()
        with socket.create_connection((h, port), timeout=5.0) as sock:
            with ctx.wrap_socket(sock, server_hostname=h) as ssock:
                cert = ssock.getpeercert()
        not_before = _parse_ssl_time(cert.get("notBefore")) if cert else None
        not_after = _parse_ssl_time(cert.get("notAfter")) if cert else None
        days_remaining = None
        if not_after is not None:
            days_remaining = (not_after - datetime.now(timezone.utc)).days
        subject = None
        issuer = None
        if cert:
            try:
                subject = ", ".join("{}={}".format(k, v) for r in cert.get("subject", []) for (k, v) in r)
            except Exception:
                subject = None
            try:
                issuer = ", ".join("{}={}".format(k, v) for r in cert.get("issuer", []) for (k, v) in r)
            except Exception:
                issuer = None
        return {
            "subject": subject,
            "issuer": issuer,
            "not_before": not_before.isoformat() if not_before else None,
            "not_after": not_after.isoformat() if not_after else None,
            "days_remaining": days_remaining if days_remaining is not None else None,
        }
    except Exception:
        return {
            "subject": None,
            "issuer": None,
            "not_before": None,
            "not_after": None,
            "days_remaining": None,
        }
