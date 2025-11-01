from datetime import datetime
from sqlalchemy.orm import declarative_base
from sqlalchemy import Column, Integer, String, DateTime, Text, JSON


Base = declarative_base()


class ScanUrlRecord(Base):
    __tablename__ = "scan_url_records"

    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    input_url = Column(Text, nullable=False)
    normalized_url = Column(Text, nullable=False)
    final_url = Column(Text, nullable=True)
    http_status = Column(Integer, nullable=True)
    score = Column(Integer, nullable=False)
    level = Column(String(16), nullable=False)
    result_json = Column(JSON, nullable=False)


class ScanFileRecord(Base):
    __tablename__ = "scan_file_records"

    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    filename = Column(Text, nullable=False)
    size = Column(Integer, nullable=False)
    format = Column(String(32), nullable=False)
    score = Column(Integer, nullable=False)
    level = Column(String(16), nullable=False)
    result_json = Column(JSON, nullable=False)


class ChatMessageRecord(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    role = Column(String(16), nullable=False)  # user | assistant
    text = Column(Text, nullable=False)
    mode = Column(String(32), nullable=True)
    persona = Column(String(16), nullable=True)
    session_id = Column(String(64), nullable=True)
    model_name = Column(String(64), nullable=True)
