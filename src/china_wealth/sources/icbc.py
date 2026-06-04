"""ICBC (工商银行) wealth product price source.

Products distributed by ICBC. Covers net-value products (净值型) from 工银理财
and other issuers sold through ICBC.

Products are identified by `prodId`, e.g. `26G5619A`.

API endpoints (POST with JSON body):
  Product detail:  POST https://papi.icbc.com.cn/finance/financeWap/detail
                   Body: {"productId": "<prodId>"}
  NAV history:     POST https://papi.icbc.com.cn/finance/deposit/consignment/getNetValueList
                   Body: {"prodId": "<prodId>", "pageIndex": 1, "pageSize": 10}

The detail endpoint uses `productId`; the NAV endpoint uses `prodId`.
Both return JSON with `code` (0 = success) and `data`.

NAV history response fields per entry:
  - `workDate`  — ISO date, e.g. "2026-06-03"
  - `value`     — unit NAV (e.g. "1.000000")
  - `totValue`  — accumulated NAV (e.g. "1.000000")
  - `prodName`  — product name

The detail endpoint does not expose a CBIRC register code; `register_code`
is always `None`.
"""

import datetime
from decimal import Decimal
from typing import List, Optional
from zoneinfo import ZoneInfo

from china_wealth.http import legacy_tls_session

from china_wealth.source import BaseSource, SourcePrice
from china_wealth.types import NavEntry, ProductShareInfo

_TZ = ZoneInfo("Asia/Shanghai")
_DETAIL_URL = "https://papi.icbc.com.cn/finance/financeWap/detail"
_NAV_URL = "https://papi.icbc.com.cn/finance/deposit/consignment/getNetValueList"

_HEADERS_DETAIL = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36",
    "Accept": "application/json, text/plain, */*",
    "Content-Type": "application/json",
    "Origin": "https://m.icbc.com.cn",
    "Referer": "https://m.icbc.com.cn/",
    "X-Tag-Papi": "gray",
}

_HEADERS_NAV = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36",
    "Accept": "application/json, text/plain, */*",
    "Content-Type": "application/json",
    "Origin": "https://www.icbc.com.cn",
    "Referer": "https://www.icbc.com.cn/",
    "X-Tag-Papi": "gray",
}


class IcbcSource(BaseSource):
    """Price source for wealth products distributed by ICBC (工商银行)."""

    @property
    def source(self) -> str:
        return "icbc"

    def get_latest_price(self, ticker: str) -> Optional[SourcePrice]:
        entries = self._fetch_nav_page(ticker, page_index=1, page_size=1)
        if not entries:
            return None
        entry = entries[0]
        nav_str = entry.get("value")
        if not nav_str:
            return None
        nav_date = _parse_date(entry.get("workDate", ""))
        ts = (
            datetime.datetime.combine(nav_date, datetime.time(15, 0), tzinfo=_TZ)
            if nav_date
            else None
        )
        return SourcePrice(price=Decimal(nav_str), time=ts, quote_currency="CNY")

    def get_product_info(self, ticker: str) -> ProductShareInfo:
        data = self._fetch_detail(ticker)
        return ProductShareInfo(
            source=self.source,
            ticker=ticker,
            name=data.get("productName", ""),
            register_code=None,
            nav=None,
            nav_date=None,
            accumulated_nav=None,
        )

    def get_nav_series(
        self,
        ticker: str,
        time_begin: datetime.datetime,
        time_end: datetime.datetime,
    ) -> Optional[List[NavEntry]]:
        all_entries = self._fetch_all_nav(ticker)
        result = []
        for e in all_entries:
            d = _parse_date(e.get("workDate", ""))
            if d is None:
                continue
            ts = datetime.datetime.combine(d, datetime.time(), tzinfo=_TZ)
            if not (time_begin <= ts <= time_end):
                continue
            nav_str = e.get("value")
            tot_str = e.get("totValue")
            if not nav_str:
                continue
            result.append(NavEntry(
                date=d,
                nav=Decimal(nav_str),
                accumulated_nav=Decimal(tot_str) if tot_str else None,
                currency="CNY",
            ))
        return sorted(result, key=lambda e: e.date)

    def get_prices_series(
        self,
        ticker: str,
        time_begin: datetime.datetime,
        time_end: datetime.datetime,
    ) -> Optional[List[SourcePrice]]:
        entries = self.get_nav_series(ticker, time_begin, time_end)
        if entries is None:
            return None
        return [
            SourcePrice(
                price=e.nav,
                time=datetime.datetime.combine(e.date, datetime.time(), tzinfo=_TZ),
                quote_currency=e.currency,
            )
            for e in entries
        ]

    def _fetch_detail(self, ticker: str) -> dict:
        resp = legacy_tls_session().post(
            _DETAIL_URL,
            json={"productId": ticker},
            headers=_HEADERS_DETAIL,
            timeout=15,
        )
        resp.raise_for_status()
        body = resp.json()
        if body.get("code") != 0:
            raise ValueError(f"ICBC API error: {body.get('message')}")
        return body.get("data") or {}

    def _fetch_nav_page(self, ticker: str, page_index: int, page_size: int) -> List[dict]:
        resp = legacy_tls_session().post(
            _NAV_URL,
            json={"prodId": ticker, "pageIndex": page_index, "pageSize": page_size},
            headers=_HEADERS_NAV,
            timeout=15,
        )
        resp.raise_for_status()
        body = resp.json()
        if body.get("code") != 0:
            raise ValueError(f"ICBC API error: {body.get('message')}")
        return (body.get("data") or {}).get("list") or []

    def _fetch_all_nav(self, ticker: str) -> List[dict]:
        page_size = 50
        page = 1
        all_entries: List[dict] = []
        while True:
            entries = self._fetch_nav_page(ticker, page_index=page, page_size=page_size)
            all_entries.extend(entries)
            if len(entries) < page_size:
                break
            page += 1
        return all_entries


def _parse_date(s: str) -> Optional[datetime.date]:
    for fmt in ("%Y-%m-%d", "%Y%m%d"):
        try:
            return datetime.datetime.strptime(s, fmt).date()
        except ValueError:
            continue
    return None


Source = IcbcSource  # beanprice expects module.Source()
