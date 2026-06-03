"""Ping An Wealth (平安理财) price source.

API endpoints:
  Product detail:  GET finacDetail.do?prdCode=<id>&sceneCode=PrdTempINI606&access_source=H5
  NAV history:     GET finaChildQuotationList.do?prdCode=<id>&pageNum=1&pageSize=20
                     &endDate=<YYYYMMDD>&access_source=H5

Both endpoints are under:
  https://rmb.pingan.com.cn/bron/ibank/pop/finachild/bootpage/

NAV history response fields per entry: nav, totNav, yeildDate (sic, YYYYMMDD).
Server caps pageSize at 20; use endDate pagination for older entries (single request
gives latest 20).
"""

import datetime
from decimal import Decimal
from typing import List, Optional
from zoneinfo import ZoneInfo

import requests

from china_wealth.source import BaseSource, SourcePrice
from china_wealth.types import NavEntry, ProductInfo

_TZ = ZoneInfo("Asia/Shanghai")
_BASE = "https://rmb.pingan.com.cn/bron/ibank/pop/finachild/bootpage"

_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36",
    "Referer": "https://b.pingan.com.cn/",
    "Accept": "*/*",
    "Origin": "https://b.pingan.com.cn",
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
        data = self._fetch_detail(product_id)
        latest_rate = data.get("latestRate") or {}
        nav_str = (latest_rate.get("nav") or data.get("netValue")
                   or data.get("nav") or data.get("unitNav"))
        nav = Decimal(str(nav_str)) if nav_str else None

        total_str = latest_rate.get("totNav") or data.get("totalNetValue") or data.get("totNav")
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

    def get_nav_series(
        self,
        ticker: str,
        time_begin: datetime.datetime,
        time_end: datetime.datetime,
    ) -> Optional[List[NavEntry]]:
        # endDate = end_time date in YYYYMMDD; fetch latest 20 entries in one request
        end_date = time_end.strftime("%Y%m%d")
        entries = self._fetch_nav_list(ticker, end_date=end_date)
        result = []
        for e in entries:
            d = _parse_date(e.get("yeildDate") or e.get("issDate") or "")
            if d is None:
                continue
            ts = datetime.datetime.combine(d, datetime.time(), tzinfo=_TZ)
            if time_begin <= ts <= time_end:
                nav = Decimal(str(e["nav"]))
                tot = e.get("totNav")
                result.append(NavEntry(
                    date=d,
                    nav=nav,
                    accumulated_nav=Decimal(str(tot)) if tot else None,
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

    def _fetch_detail(self, product_id: str) -> dict:
        resp = requests.get(
            f"{_BASE}/finacDetail.do",
            params={"prdCode": product_id, "sceneCode": "PrdTempINI606", "access_source": "H5"},
            headers=_HEADERS,
            timeout=15,
        )
        resp.raise_for_status()
        body = resp.json()
        data = body.get("data") or body.get("result") or body
        if isinstance(data, list):
            data = data[0] if data else {}
        return data

    def _fetch_nav_list(self, product_id: str, end_date: str) -> List[dict]:
        resp = requests.get(
            f"{_BASE}/finaChildQuotationList.do",
            params={
                "prdCode": product_id,
                "pageNum": 1,
                "pageSize": 20,
                "endDate": end_date,
                "access_source": "H5",
            },
            headers=_HEADERS,
            timeout=15,
        )
        resp.raise_for_status()
        body = resp.json()
        return (body.get("data") or {}).get("list") or []


def _parse_date(s: str) -> Optional[datetime.date]:
    for fmt in ("%Y%m%d", "%Y-%m-%d", "%Y/%m/%d"):
        try:
            return datetime.datetime.strptime(s, fmt).date()
        except ValueError:
            continue
    return None

Source = PinganSource  # beanprice expects module.Source()
