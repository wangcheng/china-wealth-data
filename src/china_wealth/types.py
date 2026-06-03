"""Shared types for china-wealth-data."""

import datetime
from dataclasses import dataclass
from decimal import Decimal
from typing import Optional


@dataclass
class ProductInfo:
    """Metadata for a wealth management product."""

    issuer: str
    product_id: str
    name: str
    register_code: Optional[str]  # CBIRC 登记编码, e.g. "Z7003322000117"
    nav: Optional[Decimal]
    nav_date: Optional[datetime.date]
    currency: str = "CNY"
