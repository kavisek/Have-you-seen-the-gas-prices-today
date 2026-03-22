"""initial tariffiq tables

Revision ID: 001
Revises:
Create Date: 2026-03-22

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "products",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
    )
    op.create_table(
        "classifications",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("product_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("products.id", ondelete="CASCADE"), nullable=True),
        sa.Column("hts_code", sa.String(20), nullable=False),
        sa.Column("canadian_code", sa.String(20), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("mfn_rate", sa.String(50), nullable=True),
        sa.Column("usmca_rate", sa.String(50), nullable=True),
        sa.Column("confidence", sa.Float(), nullable=True),
        sa.Column("reasoning", sa.Text(), nullable=True),
        sa.Column("gri_applied", sa.String(10), nullable=True),
        sa.Column("ai_model", sa.String(50), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
    )
    op.create_table(
        "bom_items",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("product_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("products.id", ondelete="CASCADE"), nullable=True),
        sa.Column("material_name", sa.String(255), nullable=False),
        sa.Column("origin_country", sa.String(3), nullable=False),
        sa.Column("hts_code", sa.String(20), nullable=True),
        sa.Column("unit_cost", sa.Numeric(12, 2), nullable=False),
        sa.Column("currency", sa.String(3), server_default="CAD"),
        sa.Column("is_originating", sa.Boolean(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
    )
    op.create_table(
        "usmca_determinations",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("product_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("products.id", ondelete="CASCADE"), nullable=True),
        sa.Column("hts_code", sa.String(20), nullable=False),
        sa.Column("rule_applied", sa.String(100), nullable=True),
        sa.Column("method", sa.String(50), nullable=True),
        sa.Column("transaction_value", sa.Numeric(14, 2), nullable=True),
        sa.Column("vnm_value", sa.Numeric(14, 2), nullable=True),
        sa.Column("rvc_percentage", sa.Numeric(5, 2), nullable=True),
        sa.Column("threshold", sa.Numeric(5, 2), nullable=True),
        sa.Column("qualifies", sa.Boolean(), nullable=True),
        sa.Column("reasoning", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
    )
    op.create_table(
        "engineering_opportunities",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("product_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("products.id", ondelete="CASCADE"), nullable=True),
        sa.Column("current_hts", sa.String(20), nullable=True),
        sa.Column("alternative_hts", sa.String(20), nullable=True),
        sa.Column("current_rate", sa.String(50), nullable=True),
        sa.Column("alternative_rate", sa.String(50), nullable=True),
        sa.Column("required_change", sa.Text(), nullable=True),
        sa.Column("confidence", sa.String(20), nullable=True),
        sa.Column("ruling_recommended", sa.Boolean(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
    )
    op.create_table(
        "documents",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("product_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("products.id", ondelete="CASCADE"), nullable=True),
        sa.Column("doc_type", sa.String(50), nullable=False),
        sa.Column("file_path", sa.String(500), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
    )


def downgrade() -> None:
    op.drop_table("documents")
    op.drop_table("engineering_opportunities")
    op.drop_table("usmca_determinations")
    op.drop_table("bom_items")
    op.drop_table("classifications")
    op.drop_table("products")
