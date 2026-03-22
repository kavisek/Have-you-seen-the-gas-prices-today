import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Numeric, String, Text, Uuid
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


class Product(Base):
    __tablename__ = "products"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now()
    )

    classifications: Mapped[list["Classification"]] = relationship(
        back_populates="product", cascade="all, delete-orphan"
    )
    bom_items: Mapped[list["BomItem"]] = relationship(
        back_populates="product", cascade="all, delete-orphan"
    )
    usmca_determinations: Mapped[list["UsmcaDetermination"]] = relationship(
        back_populates="product", cascade="all, delete-orphan"
    )
    engineering_opportunities: Mapped[list["EngineeringOpportunity"]] = relationship(
        back_populates="product", cascade="all, delete-orphan"
    )
    documents: Mapped[list["Document"]] = relationship(
        back_populates="product", cascade="all, delete-orphan"
    )


class Classification(Base):
    __tablename__ = "classifications"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    product_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid, ForeignKey("products.id", ondelete="CASCADE"), nullable=True
    )
    hts_code: Mapped[str] = mapped_column(String(20), nullable=False)
    canadian_code: Mapped[str | None] = mapped_column(String(20), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    mfn_rate: Mapped[str | None] = mapped_column(String(50), nullable=True)
    usmca_rate: Mapped[str | None] = mapped_column(String(50), nullable=True)
    confidence: Mapped[float | None] = mapped_column(Float, nullable=True)
    reasoning: Mapped[str | None] = mapped_column(Text, nullable=True)
    gri_applied: Mapped[str | None] = mapped_column(String(10), nullable=True)
    ai_model: Mapped[str | None] = mapped_column(String(50), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now()
    )

    product: Mapped["Product | None"] = relationship(back_populates="classifications")


class BomItem(Base):
    __tablename__ = "bom_items"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    product_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid, ForeignKey("products.id", ondelete="CASCADE"), nullable=True
    )
    material_name: Mapped[str] = mapped_column(String(255), nullable=False)
    origin_country: Mapped[str] = mapped_column(String(3), nullable=False)
    hts_code: Mapped[str | None] = mapped_column(String(20), nullable=True)
    unit_cost: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(3), default="CAD")
    is_originating: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now()
    )

    product: Mapped["Product | None"] = relationship(back_populates="bom_items")


class UsmcaDetermination(Base):
    __tablename__ = "usmca_determinations"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    product_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid, ForeignKey("products.id", ondelete="CASCADE"), nullable=True
    )
    hts_code: Mapped[str] = mapped_column(String(20), nullable=False)
    rule_applied: Mapped[str | None] = mapped_column(String(100), nullable=True)
    method: Mapped[str | None] = mapped_column(String(50), nullable=True)
    transaction_value: Mapped[float | None] = mapped_column(Numeric(14, 2), nullable=True)
    vnm_value: Mapped[float | None] = mapped_column(Numeric(14, 2), nullable=True)
    rvc_percentage: Mapped[float | None] = mapped_column(Numeric(5, 2), nullable=True)
    threshold: Mapped[float | None] = mapped_column(Numeric(5, 2), nullable=True)
    qualifies: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    reasoning: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now()
    )

    product: Mapped["Product | None"] = relationship(back_populates="usmca_determinations")


class EngineeringOpportunity(Base):
    __tablename__ = "engineering_opportunities"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    product_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid, ForeignKey("products.id", ondelete="CASCADE"), nullable=True
    )
    current_hts: Mapped[str | None] = mapped_column(String(20), nullable=True)
    alternative_hts: Mapped[str | None] = mapped_column(String(20), nullable=True)
    current_rate: Mapped[str | None] = mapped_column(String(50), nullable=True)
    alternative_rate: Mapped[str | None] = mapped_column(String(50), nullable=True)
    required_change: Mapped[str | None] = mapped_column(Text, nullable=True)
    confidence: Mapped[str | None] = mapped_column(String(20), nullable=True)
    ruling_recommended: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now()
    )

    product: Mapped["Product | None"] = relationship(
        back_populates="engineering_opportunities"
    )


class Document(Base):
    __tablename__ = "documents"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    product_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid, ForeignKey("products.id", ondelete="CASCADE"), nullable=True
    )
    doc_type: Mapped[str] = mapped_column(String(50), nullable=False)
    file_path: Mapped[str | None] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now()
    )

    product: Mapped["Product | None"] = relationship(back_populates="documents")
