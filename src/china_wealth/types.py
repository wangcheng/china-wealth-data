"""Shared types for china-wealth-data."""

import datetime
from dataclasses import dataclass, field
from decimal import Decimal
from typing import List, NamedTuple, Optional


@dataclass
class ProductInfo:
    """Metadata for a wealth management product."""

    issuer: str
    product_id: str
    name: str
    register_code: Optional[str]  # CBIRC 登记编码, e.g. "Z7003322000117"
    nav: Optional[Decimal]
    nav_date: Optional[datetime.date]
    accumulated_nav: Optional[Decimal] = None
    currency: str = "CNY"


# Richer NAV entry used by get_nav_series — not part of the beanprice interface.
NavEntry = NamedTuple(
    "NavEntry",
    [
        ("date", datetime.date),
        ("nav", Decimal),
        ("accumulated_nav", Optional[Decimal]),
        ("currency", str),
    ],
)
