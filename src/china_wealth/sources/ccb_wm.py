"""CCB Wealth (建信理财) price source.

Product search: https://www.wealthccb.com/productList.html
Product detail: https://www.wealthccb.com/product/<slug>.html

CCB product pages use a numeric page slug that differs from the user-facing
product ID. Find the slug by browsing the product list and following the link
to the detail page. Pass the numeric slug directly as the ticker (e.g. "9783965").

The page is server-rendered HTML; NAV and metadata are extracted from the
DOM via regex. No inline JSON or structured data is present.

TODO: Discover an API or lookup mechanism to resolve user-facing product ID -> page slug.

TODO: Replace `_extract_accumulated_nav` regex with dukpy (Duktape JS engine)
  to evaluate the embedded echartsBox() script directly. This would be robust
  against whitespace and code formatting changes. Plan:
  1. Add `dukpy` to pyproject.toml dependencies.
  2. Extract the <script> block containing echartsBox.
  3. Stub browser globals ($, echarts, document, etc.) as no-ops.
  4. Call echartsBox("all", false, true) and echartsBox("all", false, false)
     to get the accumulated and unit sData arrays.
  5. Read the last element of each array as the latest NAV values.
"""

import datetime
import re
from decimal import Decimal
from typing import Optional
from zoneinfo import ZoneInfo

import requests

from china_wealth.source import BaseSource, SourcePrice
from china_wealth.types import ProductShareInfo

_TZ = ZoneInfo("Asia/Shanghai")
_BASE_URL = "https://www.wealthccb.com/product/{slug}.html"

_HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; china-wealth-data)",
    "Referer": "https://www.wealthccb.com/",
}


class CcbWmSource(BaseSource):
    """Price source for CCB Wealth (建信理财) products.

    Until a user-facing product ID -> page slug mapping is available, pass the
    numeric page slug as the ticker (e.g. "9783965").
    """

    @property
    def source(self) -> str:
        return "ccb_wm"

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

    def get_product_info(self, ticker: str) -> ProductShareInfo:
        html = self._fetch_page(ticker)

        name = _extract(
            html, r'<h4[^>]*class="cp-title"[^>]*>\s*([^<]+?)\s*(?:<span>|<)'
        ) or ""
        name = name.strip()

        # Register code (CBIRC 登记编码): not exposed on CCB product pages.
        register_code = None

        m = re.search(
            r'<p\s+class="firtst">\s*([0-9.]+)\s*</p>\s*'
            r'<p\s+class="second">\s*最新净值\((\d{4}-\d{2}-\d{2})\)',
            html,
            re.DOTALL,
        )
        if m:
            nav = Decimal(m.group(1))
            nav_date = _parse_date(m.group(2))
        else:
            nav = None
            nav_date = None

        accumulated_nav = _extract_accumulated_nav(html)

        return ProductShareInfo(
            source=self.source,
            ticker=ticker,
            name=name,
            register_code=register_code,
            nav=nav,
            nav_date=nav_date,
            accumulated_nav=accumulated_nav,
        )

    def _fetch_page(self, slug: str) -> str:
        url = _BASE_URL.format(slug=slug)
        resp = requests.get(url, headers=_HEADERS, timeout=15)
        resp.raise_for_status()
        return resp.text


def _extract_accumulated_nav(html: str) -> Optional[Decimal]:
    """Extract the latest accumulated NAV (累计净值) from the JS chart data.

    The page embeds parallel unit/accumulated NAV arrays in echartsBox():
      if (bool) { sData = [...累计净值...] } else { sData = [...单位净值...] }
    We find the last (most recent) value from the bool=true array in the
    成立以来 (all-time) section, which follows the last `} else {` branch.
    """
    pattern = r'if\s*\(bool\)\s*\{\s*sData\s*=\s*\[([\d\s.,]+)\]\s*;'
    matches = re.findall(pattern, html)
    if not matches:
        return None
    numbers = re.findall(r'[\d.]+', matches[-1])
    if not numbers:
        return None
    return Decimal(numbers[-1])


def _extract(html: str, pattern: str, flags: int = 0) -> Optional[str]:
    m = re.search(pattern, html, flags)
    return m.group(1) if m else None


def _parse_date(s: str) -> Optional[datetime.date]:
    for fmt in ("%Y%m%d", "%Y-%m-%d", "%Y/%m/%d"):
        try:
            return datetime.datetime.strptime(s, fmt).date()
        except ValueError:
            continue
    return None


Source = CcbWmSource  # beanprice expects module.Source()
