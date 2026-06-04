"""Ping An Wealth Management (平安理财) price source via wm.pingan.com.

Products are identified by productCode (share code), e.g. LHCZGS141I.

Browse: https://wm.pingan.com/#/product
Detail: https://wm.pingan.com/#/product/productDetail?productCode=LHCZGS141I&raiseType=0

API endpoints (base: https://wmm.pingan.com.cn/app):
  Product info:  GET /product/getProductInfo?productCode=<code>
                   Returns name, registerCode. No NAV.
  NAV history:   POST /nvl/getNvlView (SM4-ECB-PKCS7 encrypted body)
                   Body: {"productId":"<code>","pageNum":0,"pageSize":0,
                          "startDate":"YYYY-MM-DD","endDate":"YYYY-MM-DD"}
                   Returns array of {dataDate, unitValue, cumulativeValue}.

Encryption: SM4 (国密SM4) ECB mode, PKCS#7 padding.
Key (from module 221.c in the web bundle): B34440569682494CCADDAA9D603961D2
"""

import datetime
import json
import time as _time
import uuid as _uuid_mod
from decimal import Decimal
from typing import List, Optional
from zoneinfo import ZoneInfo

import requests
from gmssl import sm4 as _sm4_mod

from china_wealth.source import BaseSource, SourcePrice
from china_wealth.types import NavEntry, ProductShareInfo

_TZ = ZoneInfo("Asia/Shanghai")
_BASE = "https://wmm.pingan.com.cn/app"
_SM4_KEY = bytes.fromhex("B34440569682494CCADDAA9D603961D2")

_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36",
    "Origin": "https://wm.pingan.com",
    "Referer": "https://wm.pingan.com/",
    "Accept": "application/json, text/plain, */*",
}


def _sm4_encrypt(plaintext: bytes, key: bytes) -> bytes:
    """SM4 ECB mode with PKCS#7 padding, returns hex string bytes."""
    pad = 16 - (len(plaintext) % 16)
    plaintext = plaintext + bytes([pad] * pad)
    cipher = _sm4_mod.CryptSM4()
    cipher.set_key(key, _sm4_mod.SM4_ENCRYPT)
    return bytes(cipher.crypt_ecb(plaintext)).hex().encode()


class PinganWmSource(BaseSource):
    """Price source for 平安理财 products via wm.pingan.com."""

    @property
    def source(self) -> str:
        return "pingan_wm"

    def get_latest_price(self, ticker: str) -> Optional[SourcePrice]:
        entries = self._fetch_nav(ticker)
        if not entries:
            return None
        latest = max(entries, key=lambda e: e["dataDate"])
        nav_str = latest.get("unitValue")
        if not nav_str:
            return None
        nav_date = datetime.date.fromisoformat(latest["dataDate"])
        ts = datetime.datetime.combine(nav_date, datetime.time(15, 0), tzinfo=_TZ)
        return SourcePrice(price=Decimal(nav_str), time=ts, quote_currency="CNY")

    def get_product_info(self, ticker: str) -> ProductShareInfo:
        data = self._fetch_product_info(ticker)
        return ProductShareInfo(
            source=self.source,
            ticker=ticker,
            name=data.get("productSname") or data.get("productName", ""),
            register_code=data.get("registerCode"),
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
        entries = self._fetch_nav(
            ticker,
            start_date=time_begin.strftime("%Y-%m-%d"),
            end_date=time_end.strftime("%Y-%m-%d"),
        )
        result = []
        for e in entries:
            d = datetime.date.fromisoformat(e["dataDate"])
            ts = datetime.datetime.combine(d, datetime.time(), tzinfo=_TZ)
            if time_begin <= ts <= time_end:
                nav = Decimal(e["unitValue"])
                cum = e.get("cumulativeValue")
                result.append(NavEntry(
                    date=d,
                    nav=nav,
                    accumulated_nav=Decimal(cum) if cum else None,
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

    def _fetch_product_info(self, ticker: str) -> dict:
        resp = requests.get(
            f"{_BASE}/product/getProductInfo",
            params={"productCode": ticker},
            headers=_HEADERS,
            timeout=15,
        )
        resp.raise_for_status()
        body = resp.json()
        if body.get("responseCode") != "000000":
            raise ValueError(f"API error: {body.get('responseMsg')}")
        return body.get("data") or {}

    def _fetch_nav(
        self,
        ticker: str,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
    ) -> List[dict]:
        millis = str(int(_time.time() * 1000))
        payload = json.dumps(
            {
                "productId": ticker,
                "currentTimeMillis": millis,
                "pageNum": 0,
                "pageSize": 0,
                "startDate": start_date,
                "endDate": end_date,
                "uuid": str(_uuid_mod.uuid4()),
            },
            separators=(",", ":"),
            ensure_ascii=False,
        )
        encrypted = _sm4_encrypt(payload.encode("utf-8"), _SM4_KEY)
        resp = requests.post(
            f"{_BASE}/nvl/getNvlView",
            data=encrypted,
            headers={**_HEADERS, "Content-Type": "application/json"},
            timeout=15,
        )
        resp.raise_for_status()
        body = resp.json()
        if body.get("responseCode") != "000000":
            raise ValueError(f"API error: {body.get('responseMsg')}")
        return body.get("data") or []


Source = PinganWmSource  # beanprice expects module.Source()
