from __future__ import annotations

from typing import Any, Dict, Optional, List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
import asyncio
import re

from app.api.scan import URLScanRequest, scan_url  # reuse URL analysis in chat

INSIGHTS_MAX_CHARS = 1800
AI_DISABLED = os.getenv("AI_DISABLE", "false").lower() in {"1", "true", "yes"}
try:
    AI_TIMEOUT_SECONDS = int(os.getenv("AI_TIMEOUT_SECONDS", "8"))
except Exception:
    AI_TIMEOUT_SECONDS = 8

router = APIRouter(prefix="/api/v1/ai", tags=["ai"])


class ExplainRequest(BaseModel):
    kind: str  # "url" | "file"
    data: Dict[str, Any]


class ExplainResponse(BaseModel):
    ok: bool
    summary: str
    guidance: str
    model: Optional[str] = None
    error: Optional[str] = None


def _build_prompt(payload: ExplainRequest) -> str:
    k = payload.kind
    d = payload.data
    if k == "url":
        score = d.get("score")
        level = d.get("level")
        factors = d.get("factors", [])
        http = d.get("http", {})
        dns = d.get("dns", {})
        final_url = http.get("final_url") or d.get("normalized_url") or d.get("input_url")
        parts = [
            "You are a cybersecurity assistant. Provide a short, clear risk summary and actionable guidance.",
            f"Final URL: {final_url}",
            f"Score: {score} (level: {level})",
            f"HTTP: status={http.get('status')} server={http.get('server')} content_type={http.get('content_type')}",
            f"DNS IPs: {', '.join(dns.get('ips', []))}",
            f"Factors: {', '.join(factors)}",
            "Write:",
            "1) A concise summary of risk in 2-4 sentences.",
            "2) 3-6 bullet recommendations for a non-technical user.",
            "Keep to ~150-220 words total. No markdown headings, just paragraphs and plain bullets.",
        ]
        return "\n".join(parts)
    else:
        # file
        score = d.get("score")
        level = d.get("level")
        factors = d.get("factors", [])
        fmt = d.get("format")
        filename = d.get("filename")
        hashes = d.get("hashes", {})
        parts = [
            "You are a cybersecurity assistant. Provide a short, clear risk summary and actionable guidance.",
            f"File: {filename} (format={fmt})",
            f"Score: {score} (level: {level})",
            f"Hashes: sha256={hashes.get('sha256')} sha1={hashes.get('sha1')} md5={hashes.get('md5')}",
            f"Factors: {', '.join(factors)}",
            "Write:",
            "1) A concise summary of risk in 2-4 sentences.",
            "2) 3-6 bullet recommendations for a non-technical user.",
            "Keep to ~150-220 words total. No markdown headings, just paragraphs and plain bullets.",
        ]
        return "\n".join(parts)


def _fallback_summary(payload: ExplainRequest) -> ExplainResponse:
    k = payload.kind
    d = payload.data
    level = d.get("level")
    score = d.get("score")
    factors = d.get("factors", [])
    summary = (
        f"This {'URL' if k == 'url' else 'file'} shows a {level or 'unknown'} risk level (score {score}). "
        f"Key signals: {', '.join(factors) if factors else 'none provided'}. "
        "Review carefully before proceeding."
    )
    guidance = (
        "- Keep software and antivirus up to date.\n"
        "- If unsure, avoid interacting and verify the source.\n"
        "- Use a sandbox or isolated device for suspicious items.\n"
        "- Do not enter credentials on untrusted pages.\n"
        "- When in doubt, consult your security team."
    )
    return ExplainResponse(ok=True, summary=summary, guidance=guidance, model="fallback")


async def _run_with_timeout(func, *args, **kwargs):
    return await asyncio.wait_for(asyncio.to_thread(func, *args, **kwargs), timeout=AI_TIMEOUT_SECONDS)


@router.post("/explain", response_model=ExplainResponse)
async def explain(payload: ExplainRequest) -> ExplainResponse:
    if AI_DISABLED:
        return _fallback_summary(payload)
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return _fallback_summary(payload)

    try:
        import google.generativeai as genai

        genai.configure(api_key=api_key)
        model_name = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
        model = genai.GenerativeModel(model_name=model_name)
        prompt = _build_prompt(payload)
        resp = await _run_with_timeout(model.generate_content, prompt)
        text = (resp.text or "").strip() if resp else ""
        if not text:
            return _fallback_summary(payload)
        # Attempt to split into summary and guidance
        if "\n- " in text:
            first_line, rest = text.split("\n- ", 1)
            summary = first_line.strip()
            guidance = "- " + rest.strip()
        else:
            # crude split
            parts = text.split("\n\n", 1)
            summary = parts[0][:INSIGHTS_MAX_CHARS]
            guidance = parts[1][:INSIGHTS_MAX_CHARS] if len(parts) > 1 else ""
        return ExplainResponse(ok=True, summary=summary, guidance=guidance, model=model_name)
    except asyncio.TimeoutError:
        return _fallback_summary(payload)
    except Exception:
        return _fallback_summary(payload)


# ---------------- Chat API ----------------

class ChatMessage(BaseModel):
    role: str  # "user" | "assistant"
    text: str


class ChatRequest(BaseModel):
    message: str
    mode: Optional[str] = None  # "general" | "security_faq" | "analyze_url"
    url: Optional[str] = None
    history: Optional[List[ChatMessage]] = None
    persona: Optional[str] = None  # "guide" | "analyst" | "mentor"


class ChatResponse(BaseModel):
    ok: bool
    reply: str
    model: Optional[str] = None
    error: Optional[str] = None


def _extract_first_url(text: str) -> Optional[str]:
    m = re.search(r"https?://\S+", text)
    return m.group(0) if m else None


@router.post("/chat", response_model=ChatResponse)
async def chat(payload: ChatRequest) -> ChatResponse:
    api_key = os.getenv("GEMINI_API_KEY")
    mode = (payload.mode or "general").lower()

    # If analyze_url mode, run URL scan first
    if mode == "analyze_url":
        target = payload.url or _extract_first_url(payload.message)
        if not target:
            raise HTTPException(status_code=422, detail="No URL provided or detected in message")
        try:
            scan_result = await scan_url(URLScanRequest(url=target))
        except HTTPException as e:
            raise e
        except Exception:
            raise HTTPException(status_code=500, detail="URL scan failed")

        # If no API key, fallback to structured explain response -> single reply
        if not api_key:
            ex = _fallback_summary(ExplainRequest(kind="url", data=scan_result.dict()))
            reply = f"Summary: {ex.summary}\n\nGuidance:\n{ex.guidance}"
            return ChatResponse(ok=True, reply=reply, model="fallback")

        try:
            import google.generativeai as genai

            genai.configure(api_key=api_key)
            model_name = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
            model = genai.GenerativeModel(model_name=model_name)
            final_url = scan_result.http.final_url or scan_result.normalized_url
            prompt = "\n".join([
                "You are a cybersecurity assistant inside a link scanner.",
                f"User prompt: {payload.message}",
                f"Analyze URL: {final_url}",
                f"Score: {scan_result.score} (level: {scan_result.level})",
                f"HTTP: status={scan_result.http.status} server={scan_result.http.server} content_type={scan_result.http.content_type}",
                f"DNS IPs: {', '.join(scan_result.dns.ips)}",
                f"Factors: {', '.join(scan_result.factors)}",
                "Respond with: risk classification (safe/suspicious/malicious), short reason (2-3 lines), and 3-6 bullet safety steps.",
            ])
            resp = await _run_with_timeout(model.generate_content, prompt)
            text = (resp.text or "").strip() if resp else ""
            if not text:
                ex = _fallback_summary(ExplainRequest(kind="url", data=scan_result.dict()))
                text = f"Summary: {ex.summary}\n\nGuidance:\n{ex.guidance}"
            return ChatResponse(ok=True, reply=text, model=model_name)
        except asyncio.TimeoutError:
            ex = _fallback_summary(ExplainRequest(kind="url", data=scan_result.dict()))
            return ChatResponse(ok=True, reply=f"Summary: {ex.summary}\n\nGuidance:\n{ex.guidance}", model="fallback")
        except Exception:
            ex = _fallback_summary(ExplainRequest(kind="url", data=scan_result.dict()))
            return ChatResponse(ok=True, reply=f"Summary: {ex.summary}\n\nGuidance:\n{ex.guidance}", model="fallback")

    # General / security_faq modes (multi-turn)
    persona = (payload.persona or "guide").lower()
    if persona == "analyst":
        system_intro = (
            "You are a concise security analyst. "
            "Answer with technical clarity, bullet steps when helpful, and avoid unnecessary fluff. "
            "You can also answer general questions succinctly."
        )
    elif persona == "mentor":
        system_intro = (
            "You are a supportive mentor. "
            "Explain clearly, encourage safe behavior, and provide step-by-step guidance that is easy to follow. "
            "You can also answer general questions beyond security in a friendly tone."
        )
    else:
        system_intro = (
            "You are a helpful cybersecurity assistant for end users. "
            "Give concise answers with clear steps. If asked about web safety (HTTPS vs HTTP, verifying links, phishing), "
            "explain in simple, practical terms. You can also answer general questions beyond security."
        )

    if AI_DISABLED or not api_key:
        fallback = (
            "I'm an offline assistant. Basic guidance: \n"
            "- Prefer HTTPS over HTTP.\n"
            "- Verify sender and domain spelling.\n"
            "- Hover links to preview real destination.\n"
            "- Avoid downloading from unknown sources.\n"
            "- Use two-factor authentication and keep software updated."
        )
        return ChatResponse(ok=True, reply=fallback, model="fallback")

    try:
        import google.generativeai as genai

        genai.configure(api_key=api_key)
        model_name = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
        model = genai.GenerativeModel(model_name=model_name)

        # Map recent history to Gemini chat format
        hist_items = (payload.history or [])[-12:]
        gem_hist = []
        for m in hist_items:
            role = "user" if m.role == "user" else "model"
            gem_hist.append({"role": role, "parts": [m.text]})

        chat_sess = model.start_chat(history=gem_hist)
        # Include system intro inline to steer behavior while preserving history
        msg = f"{system_intro}\n\nUser: {payload.message}\nAssistant:"
        resp = await _run_with_timeout(chat_sess.send_message, msg)
        text = (getattr(resp, "text", "") or "").strip()
        if not text:
            text = (
                "I couldn't generate a response right now. Try again, and ensure your internet connection is stable."
            )
        return ChatResponse(ok=True, reply=text, model=model_name)
    except asyncio.TimeoutError:
        return ChatResponse(ok=True, reply=(
            "Temporary AI timeout. Basic guidance: \n"
            "- Prefer HTTPS over HTTP.\n"
            "- Verify sender and domain spelling.\n"
            "- Hover links to preview real destination.\n"
            "- Avoid downloading from unknown sources.\n"
            "- Use two-factor authentication and keep software updated."
        ), model="fallback")
    except Exception:
        return ChatResponse(ok=True, reply=(
            "Temporary AI issue. Basic guidance: \n"
            "- Prefer HTTPS over HTTP.\n"
            "- Verify sender and domain spelling.\n"
            "- Hover links to preview real destination.\n"
            "- Avoid downloading from unknown sources.\n"
            "- Use two-factor authentication and keep software updated."
        ), model="fallback")
