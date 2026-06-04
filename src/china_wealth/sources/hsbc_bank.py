"""HSBC Bank China (汇丰银行) wealth product price source.

Sells products from 施罗德交银理财 and other issuers. Products are identified
by a sub-share code such as `182481005A` (the CBIRC sub-share / fund code).

API base: https://www.hsbc.com.cn/api/wealth-cn-srbp-shp-api-cn-anonymous-prod-proxy/v0/ut

Endpoints:
  Product detail:  GET /v2/productDetail/WMP/CN/<ticker>
  NAV history:     GET /performanceHist/WMP/CN/<ticker>?date=3Y

Required header: x-hsbc-chnl-countrycode: CN

productDetail response fields:
  prodPllName   — product name
  cdcCde        — CBIRC register code (登记编码)
  nav           — unit NAV (单位净值)
  tolNav        — accumulated/total NAV (累计净值)
  issDate       — NAV date (YYYY-MM-DD)

performanceHist response fields (performanceList entries):
  unitNetWorth        — unit NAV
  cumulativeNetWorth  — accumulated NAV
  date                — date (YYYY-MM-DD)
"""

import datetime
from decimal import Decimal
from typing import List, Optional
from zoneinfo import ZoneInfo

import requests

from china_wealth.source import BaseSource, SourcePrice
from china_wealth.types import NavEntry, ProductShareInfo

_TZ = ZoneInfo("Asia/Shanghai")
_BASE = "https://www.hsbc.com.cn/api/wealth-cn-srbp-shp-api-cn-anonymous-prod-proxy/v0/ut"

_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36",
    "Accept": "*/*",
    "content-type": "application/json",
    "x-hsbc-chnl-countrycode": "CN",
    "x-hsbc-channel-id": "OHI",
    "x-hsbc-chnl-group-member": "HSBC",
    "x-hsbc-locale": "zh_CN",
    "Referer": "https://www.hsbc.com.cn/investment-platform/pws/wmp/",
}


class HsbcBankSource(BaseSource):
    """Price source for products sold through HSBC Bank China (汇丰银行)."""

    @property
    def source(self) -> str:
        return "hsbc_bank"

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
        data = self._fetch_detail(ticker)
        nav_val = data.get("nav")
        nav = Decimal(str(nav_val)) if nav_val is not None else None

        tol_val = data.get("tolNav")
        accumulated_nav = Decimal(str(tol_val)) if tol_val is not None else None

        date_str = data.get("issDate", "")[:10]  # "2026-06-03 ..." → "2026-06-03"
        nav_date = _parse_date(date_str) if date_str else None

        return ProductShareInfo(
            source=self.source,
            ticker=ticker,
            name=data.get("prodPllName", ""),
            register_code=data.get("cdcCde"),
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
        entries = self._fetch_performance_hist(ticker)
        result = []
        for e in entries:
            d = _parse_date(e.get("date", ""))
            if d is None:
                continue
            ts = datetime.datetime.combine(d, datetime.time(), tzinfo=_TZ)
            if time_begin <= ts <= time_end:
                unit = e.get("unitNetWorth")
                cumul = e.get("cumulativeNetWorth")
                if unit is None:
                    continue
                result.append(NavEntry(
                    date=d,
                    nav=Decimal(str(unit)),
                    accumulated_nav=Decimal(str(cumul)) if cumul is not None else None,
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
        resp = requests.get(
            f"{_BASE}/v2/productDetail/WMP/CN/{ticker}",
            headers=_HEADERS,
            timeout=15,
        )
        resp.raise_for_status()
        return resp.json()

    def _fetch_performance_hist(self, ticker: str) -> List[dict]:
        resp = requests.get(
            f"{_BASE}/performanceHist/WMP/CN/{ticker}",
            params={"date": "3Y"},
            headers=_HEADERS,
            timeout=15,
        )
        resp.raise_for_status()
        body = resp.json()
        return body.get("performanceList") or []


def _parse_date(s: str) -> Optional[datetime.date]:
    for fmt in ("%Y-%m-%d", "%Y%m%d", "%Y/%m/%d"):
        try:
            return datetime.datetime.strptime(s, fmt).date()
        except ValueError:
            continue
    return None


Source = HsbcBankSource  # beanprice expects module.Source()
