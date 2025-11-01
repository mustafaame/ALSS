from __future__ import annotations

import hashlib
import io
import re
import zipfile
from typing import Dict, List, Optional, Tuple

SCRIPT_EXTS = {".js", ".vbs", ".ps1", ".psm1", ".cmd", ".bat", ".sh"}
EXEC_EXTS = {".exe", ".scr", ".dll", ".bat"}
PDF_JS_PATTERNS = (b"/JS", b"/JavaScript")


def _ext(name: str) -> str:
    name = name or ""
    i = name.rfind(".")
    return name[i:].lower() if i != -1 else ""


def _double_ext(name: str) -> bool:
    # e.g., invoice.pdf.exe
    parts = name.lower().split(".")
    return len(parts) >= 3 and parts[-1] in {"exe", "scr", "bat", "js"}


def detect_format(head: bytes) -> str:
    if head.startswith(b"MZ"):
        return "pe"
    if head.startswith(b"ELF"):
        return "elf"
    if head.startswith(b"%PDF"):
        return "pdf"
    if head.startswith(b"PK\x03\x04"):
        return "zip"
    if head.startswith(b"\x7f\x45\x4c\x46"):
        return "elf"
    return "unknown"


def compute_hashes(data: bytes) -> Dict[str, str]:
    return {
        "md5": hashlib.md5(data).hexdigest(),
        "sha1": hashlib.sha1(data).hexdigest(),
        "sha256": hashlib.sha256(data).hexdigest(),
    }


def analyze_zip(data: bytes) -> Dict[str, Optional[object]]:
    info: Dict[str, Optional[object]] = {
        "entries": None,
        "has_vba": None,
        "double_ext_entries": None,
    }
    try:
        with zipfile.ZipFile(io.BytesIO(data)) as z:
            names = z.namelist()[:200]
            info["entries"] = names
            # Look for Office macro binary
            info["has_vba"] = any("vbaProject.bin" in n for n in names)
            info["double_ext_entries"] = [n for n in names if _double_ext(n)]
    except Exception:
        pass
    return info


def compute_file_threat_score(*, filename: str, size: int, content_type: Optional[str], fmt: str, data: bytes, zip_info: Dict[str, Optional[object]]) -> Tuple[int, str, List[str]]:
    points = 0
    factors: List[str] = []

    ext = _ext(filename)

    if fmt in {"pe", "elf"}:
        points += 50
        factors.append("executable")

    if ext in EXEC_EXTS:
        points += 30
        factors.append(f"exec_ext:{ext}")

    if ext in SCRIPT_EXTS:
        points += 20
        factors.append(f"script_ext:{ext}")

    if fmt == "pdf":
        head = data[:4096]
        if any(p in head for p in PDF_JS_PATTERNS):
            points += 20
            factors.append("pdf_js")

    if fmt == "zip":
        if zip_info.get("has_vba"):
            points += 35
            factors.append("office_macro")
        doubles = zip_info.get("double_ext_entries") or []
        if len(doubles) > 0:
            points += 15
            factors.append("zip_double_ext")

    if size > 25 * 1024 * 1024:
        points += 5
        factors.append("large_file")

    score = max(0, min(100, points))
    if score >= 67:
        level = "high"
    elif score >= 34:
        level = "medium"
    else:
        level = "low"

    return score, level, factors
