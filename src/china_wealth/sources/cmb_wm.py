"""CMB Wealth Management (招银理财) price source.

Products are identified by `prodTradeCode` such as `109405A`.

Product detail page:
  https://www.cmbchinawm.com/proDetail?prodTradeCode=<code>&prodClcMode=01&finType=P

API endpoints (POST, body is SM2-encrypted JSON):
  Product detail:  POST /prod-api/web/api/product/getProductDetail/<prodClcMode>
                   Body: {"prodTradeCode": "<code>"}
  NAV history:     POST /prod-api/web/api/product/getNetValAndRate
                   Body: {"prodTradeCode": "<code>"}

Request body encryption: SM2 (国密) with mode C1C2C3. The body is hex-encoded
ciphertext with a leading 04 byte (uncompressed point marker). The public key
is embedded in the site's app.js.

Required headers: tns = "<timestamp_ms>,<random10>,<sha1(random10)>"
"""

import datetime
import hashlib
import json
import random
import time
from decimal import Decimal
from typing import List, Optional
from zoneinfo import ZoneInfo

import requests
from gmssl import sm2

from china_wealth.source import BaseSource, SourcePrice
from china_wealth.types import NavEntry, ProductShareInfo

_TZ = ZoneInfo("Asia/Shanghai")
_BASE = "https://www.cmbchinawm.com/prod-api"

# SM2 public key (without 04 prefix) extracted from app.js
_SM2_PUBLIC_KEY = (
    "cf98844d3ddf6b87e124fba422e64e0b93e9bf83aff6fb8e246c0582567390099"
    "bfcb6563290e9a015f42a382053ceb3c95530201da6c8f1ba140774f3bc6a87"
)

_HEADERS_BASE = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36",
    "Referer": "https://www.cmbchinawm.com/",
    "Content-Type": "application/json",  # required — server returns 500 without it
    "Accept": "application/json, text/plain, */*",
    "Origin": "https://www.cmbchinawm.com",
    "x-b3-businessid": "LR5801PC_WEB",
}

_sm2_crypt = sm2.CryptSM2(public_key=_SM2_PUBLIC_KEY, private_key="", mode=1)


def _encrypt(payload: dict) -> str:
    """SM2-encrypt a dict payload; returns hex C1(with 04)+C3+C2 as used by the site."""
    plaintext = json.dumps(payload, separators=(",", ":")).encode()
    ciphertext = _sm2_crypt.encrypt(plaintext)
    # gmssl C1 has no 04 prefix; prepend it to match the site's format
    return "04" + ciphertext.hex()


def _tns_header() -> str:
    """Generate tns header: timestamp,nonce,sha1(nonce) — added per-request."""
    ts = int(time.time() * 1000)
    nonce = random.randint(0, 10**10)
    sig = hashlib.sha1(str(nonce).encode()).hexdigest()
    return f"{ts},{nonce},{sig}"


def _post(path: str, payload: dict) -> dict:
    headers = {**_HEADERS_BASE, "tns": _tns_header()}
    body = _encrypt(payload)
    resp = requests.post(f"{_BASE}{path}", data=body, headers=headers, timeout=15)
    resp.raise_for_status()
    return resp.json()


def _parse_date(ts_ms) -> Optional[datetime.date]:
    """Parse a Unix timestamp in milliseconds to a date."""
    if ts_ms is None:
        return None
    try:
        return datetime.datetime.fromtimestamp(int(ts_ms) / 1000, tz=_TZ).date()
    except (ValueError, OSError):
        return None


class CmbWmSource(BaseSource):
    """Price source for CMB Wealth Management (招银理财) products."""

    @property
    def source(self) -> str:
        return "cmb_wm"

    def get_latest_price(self, ticker: str) -> Optional[SourcePrice]:
        entries = self._fetch_nav_list(ticker)
        if not entries:
            return None
        latest = entries[-1]
        nav = Decimal(str(latest["nav"]))
        nav_date = _parse_date(latest.get("navDate"))
        ts = (
            datetime.datetime.combine(nav_date, datetime.time(15, 0), tzinfo=_TZ)
            if nav_date
            else None
        )
        return SourcePrice(price=nav, time=ts, quote_currency="CNY")

    def get_product_info(self, ticker: str) -> ProductShareInfo:
        detail = self._fetch_detail(ticker)
        return ProductShareInfo(
            source=self.source,
            ticker=ticker,
            name=detail.get("csName", ""),
            register_code=detail.get("prodRegId"),
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
        entries = self._fetch_nav_list(ticker)
        result = []
        for e in entries:
            d = _parse_date(e.get("navDate"))
            if d is None:
                continue
            ts = datetime.datetime.combine(d, datetime.time(), tzinfo=_TZ)
            if time_begin <= ts <= time_end:
                nav_str = e.get("nav")
                if nav_str is None:
                    continue
                accu_str = e.get("accuNav")
                result.append(NavEntry(
                    date=d,
                    nav=Decimal(str(nav_str)),
                    accumulated_nav=Decimal(str(accu_str)) if accu_str else None,
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

    def _fetch_detail(self, ticker: str, prod_clc_mode: str = "01") -> dict:
        # prodClcMode comes from the product detail page URL (?prodClcMode=01).
        # 01 is the most common value; pass it explicitly if a product uses another.
        body = _post(
            f"/web/api/product/getProductDetail/{prod_clc_mode}",
            {"prodTradeCode": ticker},
        )
        return body.get("data") or {}

    def _fetch_nav_list(self, ticker: str) -> List[dict]:
        body = _post(
            "/web/api/product/getNetValAndRate",
            {"prodTradeCode": ticker, "monthNum": "3"},
        )
        data = body.get("data")
        if isinstance(data, list):
            return data
        return []


Source = CmbWmSource  # beanprice expects module.Source()
