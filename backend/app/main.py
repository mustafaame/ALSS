from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from app.api.scan import router as scan_router
from app.api.ai import router as ai_router
from app.api.history import router as history_router
from app.db import engine
from app.models import Base

load_dotenv()

app = FastAPI(title="ALSS Backend", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    # Allow any localhost/127.0.0.1 port during development
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:\d{1,5})$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(scan_router)
app.include_router(ai_router)
app.include_router(history_router)

@app.get("/health")
async def health() -> JSONResponse:
    return JSONResponse({"status": "ok"})

@app.on_event("startup")
def on_startup() -> None:
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)
