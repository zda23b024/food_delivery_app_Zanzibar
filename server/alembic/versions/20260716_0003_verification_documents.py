"""verification documents

Revision ID: 20260716_0003
Revises: 20260629_0002
Create Date: 2026-07-16
"""

from alembic import op
import sqlalchemy as sa


revision = "20260716_0003"
down_revision = "20260629_0002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "verification_documents",
        sa.Column("user_id", sa.String(length=36), nullable=False),
        sa.Column("role", sa.String(length=40), nullable=False),
        sa.Column("document_type", sa.String(length=80), nullable=False),
        sa.Column("status", sa.String(length=40), nullable=False),
        sa.Column("document_url", sa.String(length=500), nullable=False),
        sa.Column("business_name", sa.String(length=180), nullable=True),
        sa.Column("certificate_number", sa.String(length=120), nullable=True),
        sa.Column("tax_id", sa.String(length=120), nullable=True),
        sa.Column("business_address", sa.Text(), nullable=True),
        sa.Column("service_area", sa.String(length=180), nullable=True),
        sa.Column("vehicle_type", sa.String(length=80), nullable=True),
        sa.Column("vehicle_plate_number", sa.String(length=80), nullable=True),
        sa.Column("license_number", sa.String(length=120), nullable=True),
        sa.Column("national_id_number", sa.String(length=120), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_verification_documents_document_type"), "verification_documents", ["document_type"], unique=False)
    op.create_index(op.f("ix_verification_documents_role"), "verification_documents", ["role"], unique=False)
    op.create_index(op.f("ix_verification_documents_status"), "verification_documents", ["status"], unique=False)
    op.create_index(op.f("ix_verification_documents_user_id"), "verification_documents", ["user_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_verification_documents_user_id"), table_name="verification_documents")
    op.drop_index(op.f("ix_verification_documents_status"), table_name="verification_documents")
    op.drop_index(op.f("ix_verification_documents_role"), table_name="verification_documents")
    op.drop_index(op.f("ix_verification_documents_document_type"), table_name="verification_documents")
    op.drop_table("verification_documents")
