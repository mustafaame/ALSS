from __future__ import annotations

from typing import Dict, List, Tuple
from urllib.parse import urlparse
import socket
import re

# Lightweight heuristics-based threat scoring (0-100) with factor breakdown

SUSPICIOUS_TLDS = {
    "zip",
    "mov",
    "top",
    "tk",
    "gq",
    "ml",
    "cf",
    "xyz",
    "rest",
}

CONTENT_TYPES_DOWNLOAD = {
    "application/octet-stream",
    "application/x-msdownload",
    "application/zip",
    "application/x-zip-compressed",
}

IPV4_REGEX = re.compile(r"^\d{1,3}(?:\.\d{1,3}){3}$")


def _is_ip(host: str) -> bool:
    if not host:
        return False
    host_no_port = host.split(":", 1)[0]
    if IPV4_REGEX.match(host_no_port):
        parts = host_no_port.split(".")
        return all(0 <= int(p) <= 255 for p in parts)
    # naive IPv6 check
    return ":" in host_no_port


def _tld(host: str) -> str:
    if not host:
        return ""
    host_no_port = host.split(":", 1)[0]
    if _is_ip(host_no_port):
        return ""
    bits = host_no_port.rsplit(".", 1)
    return bits[1].lower() if len(bits) == 2 else ""


def _domain(host: str) -> str:
    if not host:
        return ""
    host_no_port = host.split(":", 1)[0]
    return host_no_port.lower()


def _diff_domain(a: str, b: str) -> bool:
    return _domain(a) != _domain(b)


def compute_threat_score(*, input_url: str, final_url: str | None, http: Dict, dns_ips: List[str]) -> Tuple[int, str, List[str]]:
    points = 0
    factors: List[str] = []

    in_parsed = urlparse(input_url)
    fin_parsed = urlparse(final_url or input_url)

    # Scheme
    scheme = fin_parsed.scheme or in_parsed.scheme
    if scheme == "http":
        points += 25
        factors.append("no_https")

    # Redirects
    redirects = http.get("redirects") or []
    if isinstance(redirects, list):
        if len(redirects) > 3:
            points += 20
            factors.append("many_redirects")
        elif len(redirects) > 1:
            points += 10
            factors.append("multiple_redirects")

    # Domain change
    if _diff_domain(in_parsed.hostname or "", fin_parsed.hostname or ""):
        points += 10
        factors.append("domain_changed")

    # Host is IP literal
    host = fin_parsed.hostname or ""
    if _is_ip(host):
        points += 15
        factors.append("ip_host")

    # Suspicious TLD
    tld = _tld(host)
    if tld in SUSPICIOUS_TLDS:
        points += 10
        factors.append(f"sus_tld:{tld}")

    # Query heuristics
    query = fin_parsed.query or ""
    if len(query) > 100:
        points += 10
        factors.append("long_query")
    if query.count("=") > 5:
        points += 10
        factors.append("many_params")

    # Content-Type indicates download
    ctype = (http.get("content_type") or "").split(";")[0].strip().lower()
    if ctype in CONTENT_TYPES_DOWNLOAD:
        points += 15
        factors.append("download_mime")

    # HTTP status
    status = http.get("status")
    if isinstance(status, int) and 200 <= status < 300:
        points = max(0, points - 5)
    elif status is None:
        points += 10
        factors.append("no_http_response")

    # DNS heuristics
    if isinstance(dns_ips, list) and len(dns_ips) == 0:
        # Could be fine, but add small weight
        points += 5
        factors.append("no_dns_ips")

    # Clamp and level
    score = max(0, min(100, points))
    if score >= 67:
        level = "high"
    elif score >= 34:
        level = "medium"
    else:
        level = "low"

    return score, level, factors
