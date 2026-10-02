"""product stock non-negative check

Revision ID: 006
Revises: 005
Create Date: 2026-10-02

"""
from typing import Sequence, Union

from alembic import op

revision: str = "006"
down_revision: Union[str, None] = "005"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Safety net against negative stock at the database level
    op.create_check_constraint(
        "ck_products_stock_non_negative",
        "products",
        "stock >= 0",
    )


def downgrade() -> None:
    op.drop_constraint("ck_products_stock_non_negative", "products", type_="check")
