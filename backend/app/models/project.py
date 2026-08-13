import uuid
from datetime import datetime, timezone
from sqlalchemy import String, DateTime, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    name: Mapped[str] = mapped_column(String(255), default="Untitled Design")
    tshirt_color: Mapped[str] = mapped_column(String(7), default="#FFFFFF")
    garment_type: Mapped[str] = mapped_column(String(32), default="tshirt")
    mockup_credit: Mapped[str] = mapped_column(String(160), default="")
    front_canvas_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    back_canvas_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "tshirt_color": self.tshirt_color,
            "garment_type": self.garment_type,
            "mockup_credit": self.mockup_credit,
            "front_canvas_json": self.front_canvas_json,
            "back_canvas_json": self.back_canvas_json,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
