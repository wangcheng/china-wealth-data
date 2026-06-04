"""CMB Bank (招商银行) wealth product price source.

Products distributed by CMB Bank (not to be confused with cmb_wm which covers
招银理财's own platform). This source serves products from issuers such as
建信理财 that are sold through CMB Bank's channel.

Products are identified by `prdCode` (= `funCod`), e.g. `JXPB0201`.

Product value page:
  https://cfweb.paas.cmbchina.com/personal/prodvalue.aspx

API endpoints (POST, no body required for detail; JSON body for NAV history):
  Product info:   POST /api/ProductInfo/getproductbyprdcode?prdCode=<prdCode>
  NAV history:    POST /api/ProductValue/getSAValueByPageOrDate
                  Body: {"saaCod":"<saaCod>","funCod":"<prdCode>","pageIndex":1,
                         "pageSize":10,"startDate":"","endDate":""}

Both under: https://cfweb.paas.cmbchina.com

Signature: SM4-ECB encryption of "LB50.22_CFWebUI|<timespan_ms>", keyed with
AUTH_SN (decoded from base64), output encoded as base64. Extracted from umi.js.

NAV response fields per entry: znavVal (unit NAV), znavCtl (accumulated NAV),
znavDat (YYYYMMDD).
"""

import base64
import datetime
import time
from decimal import Decimal
from typing import List, Optional
from zoneinfo import ZoneInfo

import requests
from gmssl import sm4

from china_wealth.source import BaseSource, SourcePrice
from china_wealth.types import NavEntry, ProductShareInfo

_TZ = ZoneInfo("Asia/Shanghai")
_BASE = "https://cfweb.paas.cmbchina.com"
_APP_ID = "LB50.22_CFWebUI"
# AUTH_SN from umi.js — SM4-ECB key for signature generation
_SM4_KEY = base64.b64decode("NXF3QkdqdTczSkFYaWQ0RA==")

_HEADERS_BASE = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36",
    "Accept": "*/*",
    "Accept-Language": "en-GB,en-US;q=0.9,en;q=0.8",
    "Origin": "https://cfweb.paas.cmbchina.com",
    "Referer": "https://cfweb.paas.cmbchina.com/personal/prodvalue.aspx",
    "appid": _APP_ID,
}


def _sign_headers() -> dict:
    """Return timespan + signature headers for a request."""
    ts = int(time.time() * 1000)
    crypt = sm4.CryptSM4()
    crypt.set_key(_SM4_KEY, sm4.SM4_ENCRYPT)
    ct = crypt.crypt_ecb(f"{_APP_ID}|{ts}".encode())
    sig = base64.b64encode(ct).decode()
    return {"timespan": str(ts), "signature": sig}


class CmbBankSource(BaseSource):
    """Price source for wealth products sold through CMB Bank (招商银行)."""

    @property
    def source(self) -> str:
        return "cmb_bank"

    def get_latest_price(self, ticker: str) -> Optional[SourcePrice]:
        saacod = self._get_saacod(ticker)
        entries = self._fetch_nav_page(saacod, ticker, page_index=1, page_size=1)
        if not entries:
            return None
        entry = entries[0]
        nav_str = entry.get("znavVal")
        if not nav_str:
            return None
        date_str = entry.get("znavDat", "")
        nav_date = _parse_date(date_str)
        ts = (
            datetime.datetime.combine(nav_date, datetime.time(15, 0), tzinfo=_TZ)
            if nav_date
            else None
        )
        return SourcePrice(price=Decimal(nav_str), time=ts, quote_currency="CNY")

    def get_product_info(self, ticker: str) -> ProductShareInfo:
        data = self._fetch_product_info(ticker)
        return ProductShareInfo(
            source=self.source,
            ticker=ticker,
            name=data.get("prdName", ""),
            register_code=data.get("regCode"),
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
        saacod = self._get_saacod(ticker)
        start_date = time_begin.strftime("%Y%m%d")
        end_date = time_end.strftime("%Y%m%d")
        entries = self._fetch_all_nav(saacod, ticker, start_date=start_date, end_date=end_date)
        result = []
        for e in entries:
            d = _parse_date(e.get("znavDat", ""))
            if d is None:
                continue
            ts = datetime.datetime.combine(d, datetime.time(), tzinfo=_TZ)
            if time_begin <= ts <= time_end:
                nav_str = e.get("znavVal")
                ctl_str = e.get("znavCtl")
                if not nav_str:
                    continue
                result.append(NavEntry(
                    date=d,
                    nav=Decimal(nav_str),
                    accumulated_nav=Decimal(ctl_str) if ctl_str else None,
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

    def _get_saacod(self, ticker: str) -> str:
        data = self._fetch_product_info(ticker)
        saacod = data.get("saaCod")
        if not saacod:
            raise ValueError(f"saaCod not found for ticker {ticker!r}")
        return saacod

    def _fetch_product_info(self, ticker: str) -> dict:
        resp = requests.post(
            f"{_BASE}/api/ProductInfo/getproductbyprdcode",
            params={"prdCode": ticker},
            headers={**_HEADERS_BASE, **_sign_headers(), "content-length": "0"},
            timeout=15,
        )
        resp.raise_for_status()
        body = resp.json()
        items = body.get("body") or []
        if isinstance(items, list) and items:
            return items[0]
        if isinstance(items, dict):
            return items
        return {}

    def _fetch_nav_page(
        self,
        saacod: str,
        ticker: str,
        page_index: int = 1,
        page_size: int = 10,
        start_date: str = "",
        end_date: str = "",
    ) -> List[dict]:
        resp = requests.post(
            f"{_BASE}/api/ProductValue/getSAValueByPageOrDate",
            json={
                "saaCod": saacod,
                "funCod": ticker,
                "pageIndex": page_index,
                "pageSize": page_size,
                "startDate": start_date,
                "endDate": end_date,
            },
            headers={**_HEADERS_BASE, **_sign_headers(), "content-type": "application/json;charset=UTF-8"},
            timeout=15,
        )
        resp.raise_for_status()
        body = resp.json()
        return (body.get("body") or {}).get("data") or []

    def _fetch_all_nav(
        self,
        saacod: str,
        ticker: str,
        start_date: str = "",
        end_date: str = "",
    ) -> List[dict]:
        page_size = 50
        page = 1
        all_entries: List[dict] = []
        while True:
            entries = self._fetch_nav_page(
                saacod, ticker,
                page_index=page,
                page_size=page_size,
                start_date=start_date,
                end_date=end_date,
            )
            all_entries.extend(entries)
            if len(entries) < page_size:
                break
            page += 1
        return all_entries


def _parse_date(s: str) -> Optional[datetime.date]:
    for fmt in ("%Y%m%d", "%Y-%m-%d"):
        try:
            return datetime.datetime.strptime(s, fmt).date()
        except ValueError:
            continue
    return None


Source = CmbBankSource  # beanprice expects module.Source()
