"""ABC (中国农业银行) price source — Agricultural Bank of China bank channel.

API endpoints (no auth required):
  Quick search: POST /app/data/api/DataService/ProxyProdquickFind  {"data":{"keyword":"<ticker>"}}
  Detail:       POST /app/data/api/DataService/FsProdInfo           {"data":{"keyword":"<ticker>"}}
  NAV history:  GET  /app/data/api/DataService/OwnProdNetValueFilterV3?i=<page>&s=<size>&w=<ticker>
"""

import datetime
from decimal import Decimal
from typing import List, Optional
from zoneinfo import ZoneInfo

from china_wealth.http import legacy_tls_session
from china_wealth.source import BaseSource, SourcePrice
from china_wealth.types import NavEntry, ProductShareInfo

_BASE = "https://ewealth.abchina.com.cn/app/data/api/DataService"
_TZ = ZoneInfo("Asia/Shanghai")

_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) "
        "AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1"
    ),
    "Content-Type": "application/json",
    "Origin": "https://ewealth.abchina.com.cn",
    "Referer": "https://ewealth.abchina.com.cn/fs/",
}


class AbcSource(BaseSource):
    """Price source for ABC Wealth (农银理财) products."""

    @property
    def source(self) -> str:
        return "abc"

    def get_latest_price(self, ticker: str) -> Optional[SourcePrice]:
        row = self._fetch_nav_page(ticker, page=1, size=1)
        if not row:
            return None
        entry = row[0]
        nav_date = datetime.datetime.strptime(entry["NetDate"], "%Y-%m-%d").replace(tzinfo=_TZ)
        return SourcePrice(
            price=Decimal(entry["NetValue"]),
            time=nav_date,
            quote_currency="CNY",
        )

    def get_product_info(self, ticker: str) -> ProductShareInfo:
        detail = self._fetch_detail(ticker)
        return ProductShareInfo(
            source=self.source,
            ticker=ticker,
            name=detail.get("productName", ""),
            register_code=None,  # ABC APIs do not expose the CBIRC register code
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
        result = []
        page = 1
        size = 100
        while True:
            rows = self._fetch_nav_page(ticker, page=page, size=size)
            if not rows:
                break
            for row in rows:
                date = datetime.date.fromisoformat(row["NetDate"])
                ts = datetime.datetime.combine(date, datetime.time.min, tzinfo=_TZ)
                if ts < time_begin:
                    return sorted(result, key=lambda e: e.date)
                if ts <= time_end:
                    result.append(NavEntry(
                        date=date,
                        nav=Decimal(row["NetValue"]),
                        accumulated_nav=Decimal(row["accNetValue"]),
                        currency="CNY",
                    ))
            if len(rows) < size:
                break
            page += 1
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
                time=datetime.datetime.combine(e.date, datetime.time.min, tzinfo=_TZ),
                quote_currency="CNY",
            )
            for e in entries
        ]

    def _fetch_detail(self, ticker: str) -> dict:
        resp = legacy_tls_session().post(
            f"{_BASE}/FsProdInfo",
            json={"data": {"keyword": ticker}},
            headers=_HEADERS,
            timeout=15,
        )
        resp.raise_for_status()
        body = resp.json()
        table = body.get("result", {}).get("Table")
        if isinstance(table, dict):
            return table
        if isinstance(table, list) and table:
            return table[0]
        return {}

    def _fetch_nav_page(self, ticker: str, page: int, size: int) -> list:
        resp = legacy_tls_session().get(
            f"{_BASE}/OwnProdNetValueFilterV3",
            params={"i": page, "s": size, "w": ticker},
            headers={**_HEADERS, "X-Requested-With": "XMLHttpRequest"},
            timeout=15,
        )
        resp.raise_for_status()
        body = resp.json()
        return body.get("Data", {}).get("Table") or []


Source = AbcSource  # beanprice expects module.Source()
