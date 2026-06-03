"""CITIC Wealth (中信理财) price source.

API endpoints (no auth required):
  Product detail: GET /cms.product/api/custom/productInfo/getTAProductDetail?prodCode=<id>&prodType=2
  Latest NAV:     GET /cms.product/api/custom/productInfo/getTAProductNav?prodCode=<id>&queryUnit=1
"""

import datetime
import ssl
from decimal import Decimal
from typing import List, Optional
from zoneinfo import ZoneInfo

import requests
from requests.adapters import HTTPAdapter

from china_wealth.source import BaseSource, SourcePrice
from china_wealth.types import NavEntry, ProductShareInfo

_BASE = "https://wechat.citic-wealth.com/cms.product/api/custom/productInfo"
_TZ = ZoneInfo("Asia/Shanghai")

_HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; china-wealth-data)",
    "Referer": "https://wechat.citic-wealth.com/",
}


class _LegacyTLSAdapter(HTTPAdapter):
    """Allow legacy SSL renegotiation required by some Chinese bank servers."""

    def init_poolmanager(self, *args, **kwargs):
        ctx = ssl.create_default_context()
        ctx.options |= ssl.OP_LEGACY_SERVER_CONNECT
        kwargs["ssl_context"] = ctx
        super().init_poolmanager(*args, **kwargs)


def _session() -> requests.Session:
    s = requests.Session()
    s.mount("https://", _LegacyTLSAdapter())
    return s


class CiticWmSource(BaseSource):
    """Price source for CITIC Wealth (中信理财) products."""

    @property
    def source(self) -> str:
        return "citic_wm"

    def get_latest_price(self, ticker: str) -> Optional[SourcePrice]:
        data = self._fetch_nav(ticker)
        if data is None:
            return None
        nav = Decimal(str(data["nav"]))
        nav_date = datetime.datetime.strptime(data["navDate"], "%Y%m%d").replace(
            tzinfo=_TZ
        )
        return SourcePrice(price=nav, time=nav_date, quote_currency="CNY")

    def get_product_info(self, ticker: str) -> ProductShareInfo:
        detail = self._fetch_detail(ticker)
        nav_str = detail.get("nav")
        nav = Decimal(str(nav_str)) if nav_str is not None else None
        total_nav_str = detail.get("totalNav")
        accumulated_nav = Decimal(str(total_nav_str)) if total_nav_str is not None else None
        date_str = detail.get("navDate")
        nav_date = (
            datetime.datetime.strptime(date_str, "%Y%m%d").date() if date_str else None
        )
        return ProductShareInfo(
            source=self.source,
            ticker=ticker,
            name=detail.get("prodName", ""),
            register_code=detail.get("registCode"),  # note: "registCode" not "registerCode"
            nav=nav,
            nav_date=nav_date,
            accumulated_nav=accumulated_nav,
        )

    def get_prices_series(
        self,
        ticker: str,
        time_begin: datetime.datetime,
        time_end: datetime.datetime,
    ) -> Optional[List[SourcePrice]]:
        entries = self._fetch_nav_list(ticker)
        if entries is None:
            return None
        result = []
        for entry in entries:
            ts = datetime.datetime.strptime(entry["navDate"], "%Y%m%d").replace(tzinfo=_TZ)
            if time_begin <= ts <= time_end:
                result.append(SourcePrice(
                    price=Decimal(str(entry["nav"])),
                    time=ts,
                    quote_currency="CNY",
                ))
        return sorted(result, key=lambda p: p.time)

    def get_nav_series(
        self,
        ticker: str,
        time_begin: datetime.datetime,
        time_end: datetime.datetime,
    ) -> Optional[List[NavEntry]]:
        entries = self._fetch_nav_list(ticker)
        if entries is None:
            return None
        result = []
        for entry in entries:
            ts = datetime.datetime.strptime(entry["navDate"], "%Y%m%d").replace(tzinfo=_TZ)
            if time_begin <= ts <= time_end:
                total = entry.get("totalNav")
                result.append(NavEntry(
                    date=ts.date(),
                    nav=Decimal(str(entry["nav"])),
                    accumulated_nav=Decimal(str(total)) if total is not None else None,
                    currency="CNY",
                ))
        return sorted(result, key=lambda e: e.date)

    def _fetch_nav(self, ticker: str) -> Optional[dict]:
        entries = self._fetch_nav_list(ticker)
        if not entries:
            return None
        return entries[0]

    def _fetch_nav_list(self, ticker: str) -> Optional[list]:
        url = f"{_BASE}/getTAProductNav"
        resp = _session().get(
            url,
            params={"prodCode": ticker, "queryUnit": "1"},
            headers=_HEADERS,
            timeout=15,
        )
        resp.raise_for_status()
        body = resp.json()
        data = body.get("data") or {}
        return data.get("productNavList") or data.get("productNavPic")

    def _fetch_detail(self, ticker: str) -> dict:
        url = f"{_BASE}/getTAProductDetail"
        resp = _session().get(
            url,
            params={"prodCode": ticker, "prodType": "2"},
            headers=_HEADERS,
            timeout=15,
        )
        resp.raise_for_status()
        body = resp.json()
        data = body.get("data") or body.get("result") or {}
        if isinstance(data, list):
            data = data[0] if data else {}
        return data


Source = CiticWmSource  # beanprice expects module.Source()
