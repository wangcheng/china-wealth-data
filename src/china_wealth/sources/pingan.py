"""Ping An Wealth (平安理财) price source.

The Ping An product detail page is an H5 page that returns JSON via an
embedded API. We POST to the same endpoint the page's JS calls.

Page URL pattern:
  https://rmb.pingan.com.cn/bron/ibank/pop/finachild/bootpage/finacDetail.do
    ?prdCode=<id>&sceneCode=PrdTempINI606&access_source=H5
"""

import datetime
from decimal import Decimal
from typing import Optional
from zoneinfo import ZoneInfo

import requests

from china_wealth.source import BaseSource, SourcePrice
from china_wealth.types import ProductInfo

_TZ = ZoneInfo("Asia/Shanghai")

_DETAIL_URL = (
    "https://rmb.pingan.com.cn/bron/ibank/pop/finachild/bootpage/finacDetail.do"
)

_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    "Referer": "https://rmb.pingan.com.cn/",
    "Accept": "application/json, text/plain, */*",
}


class PinganSource(BaseSource):
    """Price source for Ping An Wealth (平安理财) products."""

    @property
    def issuer(self) -> str:
        return "pingan"

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
        data = self._fetch(product_id)
        nav_str = data.get("netValue") or data.get("nav") or data.get("unitNav")
        nav = Decimal(str(nav_str)) if nav_str else None

        total_str = data.get("totalNetValue") or data.get("totNav")
        accumulated_nav = Decimal(str(total_str)) if total_str else None

        date_str = data.get("netValueDate") or data.get("navDate")
        nav_date = _parse_date(date_str) if date_str else None

        return ProductInfo(
            issuer=self.issuer,
            product_id=product_id,
            name=data.get("prdName") or data.get("productName", ""),
            register_code=data.get("bankFundRegisterCode"),
            nav=nav,
            nav_date=nav_date,
            accumulated_nav=accumulated_nav,
        )

    def _fetch(self, product_id: str) -> dict:
        resp = requests.get(
            _DETAIL_URL,
            params={
                "prdCode": product_id,
                "sceneCode": "PrdTempINI606",
                "access_source": "H5",
            },
            headers=_HEADERS,
            timeout=15,
        )
        resp.raise_for_status()
        body = resp.json()
        # Ping An wraps response: {"code": 0, "data": {...}}
        data = body.get("data") or body.get("result") or body
        if isinstance(data, list):
            data = data[0] if data else {}
        return data


def _parse_date(s: str) -> Optional[datetime.date]:
    for fmt in ("%Y%m%d", "%Y-%m-%d", "%Y/%m/%d"):
        try:
            return datetime.datetime.strptime(s, fmt).date()
        except ValueError:
            continue
    return None

Source = PinganSource  # beanprice expects module.Source()
