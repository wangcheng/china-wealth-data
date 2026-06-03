"""Shared types for china-wealth-data."""

import datetime
from dataclasses import dataclass
from decimal import Decimal
from typing import NamedTuple, Optional


@dataclass
class ProductInfo:
    """Product-level metadata from 中国理财网 (ChinaWealthClient / lookup command).

    Represents the product as a whole — may have multiple sub-shares with
    different prices. No NAV here; use ProductShareInfo for share-level prices.
    """

    issuer: str                        # institution name, e.g. "施罗德交银理财有限公司"
    name: str
    register_code: str                 # CBIRC 登记编码, e.g. "Z7003322000117"
    sub_share_codes: list              # e.g. ["182481005A", "182481005B"]
    start_date: Optional[str] = None  # product inception date
    end_date: Optional[str] = None    # product maturity date
    operation_mode: Optional[str] = None   # 运作模式
    risk_level: Optional[str] = None       # 风险等级
    collection_method: Optional[str] = None  # 募集方式
    currency: Optional[str] = None           # 募集币种
    asset_type: Optional[str] = None         # 投资性质
    benchmark_floor: Optional[str] = None    # 业绩比较基准 lower bound
    benchmark_cap: Optional[str] = None      # 业绩比较基准 upper bound
    benchmark_note: Optional[str] = None     # 业绩比较基准 note
    has_nav: bool = False                    # whether NAV data is published on 中国理财网


@dataclass
class ProductShareInfo:
    """Share-level metadata and latest NAV, as returned by a price source.

    Every source returns data for one share of a product. The ticker is
    whatever string that source uses to identify the share — it may be a
    product code (citic_wm, pingan_bank), a page slug (ccb_wm), or an explicit
    register_code/sub_share_code pair (chinawealth).
    """

    source: str                    # source key, e.g. "citic_wm"
    ticker: str                    # as passed by the user
    name: str
    register_code: Optional[str]   # CBIRC 登记编码; None if not exposed by source
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
