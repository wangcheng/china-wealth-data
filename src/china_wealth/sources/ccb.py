"""CCB Wealth (建信理财) price source.

CCB product pages use a numeric page slug that differs from the user-facing
product ID. For example:
  https://www.wealthccb.com/product/9783965.html

The mapping from product_id to page slug is not yet determined. This source
currently requires the page slug to be passed directly as the ticker.

The page is server-rendered HTML; NAV and metadata are extracted from the
DOM via regex. No inline JSON or structured data is present.

TODO: Discover an API or lookup mechanism to resolve product_id -> page_slug.
"""

import datetime
import re
from decimal import Decimal
from typing import Optional
from zoneinfo import ZoneInfo

import requests

from china_wealth.source import BaseSource, SourcePrice
from china_wealth.types import ProductInfo

_TZ = ZoneInfo("Asia/Shanghai")
_BASE_URL = "https://www.wealthccb.com/product/{slug}.html"

_HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; china-wealth-data)",
    "Referer": "https://www.wealthccb.com/",
}


class CcbSource(BaseSource):
    """Price source for CCB Wealth (建信理财) products.

    Until a product_id -> page_slug mapping is available, pass the numeric
    page slug as the ticker (e.g. "9783965").
    """

    @property
    def issuer(self) -> str:
        return "ccb"

    def get_latest_price(self, ticker: str) -> Optional[SourcePrice]:
        info = self.get_product_info(ticker)
        if info.nav is None:
            return None
        ts = (
            datetime.datetime.combine(info.nav_date, datetime.time(15, 0), tzinfo=_TZ)
            if info.nav_date
            else None
        )
        return SourcePrice(price=info.nav, time=ts, quote_currency="CNY")

    def get_product_info(self, product_id: str) -> ProductInfo:
        # product_id is treated as the page slug until mapping is resolved
        html = self._fetch_page(product_id)

        # Product name: <h4 class="cp-title">Name <span>(Code)</span></h4>
        name = _extract(
            html, r'<h4[^>]*class="cp-title"[^>]*>\s*([^<]+?)\s*(?:<span>|<)'
        ) or ""
        name = name.strip()

        # Register code (CBIRC 登记编码): not exposed on CCB product pages.
        # The page only shows the internal product code (e.g. JXRXZDCY1Y815003A)
        # in the <h4> title span, which is not the CBIRC register code.
        register_code = None

        # NAV + date from the 最新净值 (latest NAV) block:
        #   <li class="float-left">
        #     <p class="firtst">1.028568</p>
        #     <p class="second">最新净值(2026-06-01)</p>
        #   </li>
        m = re.search(
            r'<p\s+class="firtst">\s*([0-9.]+)\s*</p>\s*'
            r'<p\s+class="second">\s*最新净值\((\d{4}-\d{2}-\d{2})\)',
            html,
            re.DOTALL,
        )
        if m:
            nav_str, date_str = m.group(1), m.group(2)
            nav = Decimal(nav_str)
            nav_date = _parse_date(date_str)
        else:
            nav = None
            nav_date = None

        return ProductInfo(
            issuer=self.issuer,
            product_id=product_id,
            name=name,
            register_code=register_code,
            nav=nav,
            nav_date=nav_date,
        )

    def _fetch_page(self, slug: str) -> str:
        url = _BASE_URL.format(slug=slug)
        resp = requests.get(url, headers=_HEADERS, timeout=15)
        resp.raise_for_status()
        return resp.text


def _extract(html: str, pattern: str, flags: int = 0) -> Optional[str]:
    """Return group(1) of the first regex match, or None."""
    m = re.search(pattern, html, flags)
    return m.group(1) if m else None


def _parse_date(s: str) -> Optional[datetime.date]:
    for fmt in ("%Y%m%d", "%Y-%m-%d", "%Y/%m/%d"):
        try:
            return datetime.datetime.strptime(s, fmt).date()
        except ValueError:
            continue
    return None


Source = CcbSource  # beanprice expects module.Source()
