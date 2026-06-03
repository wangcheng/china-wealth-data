"""China Wealth Register (中国理财网 xinxipilu.chinawealth.com.cn) API client.

This is a low-level client, not a BaseSource subclass. Issuers whose products
are published on 中国理财网 can use this client.

Ticker format: "<register_code>/<sub_share_code>", e.g. "Z7007024000248/182481005A".
Use get_product_info(register_code) to discover available sub-share codes.

Note: many issuers do not publish NAV data on 中国理财网. The API will return
basic product info but nav / navDate may be absent.

API endpoints:
  Init (session private key): POST /product/getInitData           body: {}
  Product metadata:           POST /product/getProductDetail      body: {"prodRegCode": ..., "pageNum": 1, "pageSize": 1}
  NAV history by sub-share:   POST /product/getNetValueList       body: {"prodRegCode": ..., "subShareCode": ..., "timeType": "1", "pageNum": 1, "pageSize": <n>}

All POST requests must carry a `signature` header:
  base64(RSA_SHA256_PKCS1v15_sign(JSON.stringify(body), session_private_key))
"""

import base64
import datetime
import json
import textwrap
from decimal import Decimal
from typing import List, Optional
from zoneinfo import ZoneInfo

import requests
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding

from china_wealth.source import SourcePrice
from china_wealth.types import NavEntry, ProductInfo

_BASE = "https://xinxipilu.chinawealth.com.cn/lcxp-platService"
_TZ = ZoneInfo("Asia/Shanghai")

_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36"
    ),
    "Content-Type": "application/json;charset=UTF-8",
    "Origin": "https://xinxipilu.chinawealth.com.cn",
}

# Both getProductDetail and getNetValueList ignore pageSize and always return
# 10 entries per page. Pagination is needed for full history.
_NAV_PAGE_SIZE = 10


def _load_private_key(pem_oneliner: str):
    inner = (
        pem_oneliner
        .replace("-----BEGIN PRIVATE KEY-----", "")
        .replace("-----END PRIVATE KEY-----", "")
        .strip()
    )
    pem = (
        "-----BEGIN PRIVATE KEY-----\n"
        + "\n".join(textwrap.wrap(inner, 64))
        + "\n-----END PRIVATE KEY-----"
    )
    return serialization.load_pem_private_key(
        pem.encode(), password=None, backend=default_backend()
    )


def _sign(body_str: str, private_key) -> str:
    sig = private_key.sign(body_str.encode(), padding.PKCS1v15(), hashes.SHA256())
    return base64.b64encode(sig).decode()


def _serialize(body: dict) -> str:
    return json.dumps(body, separators=(",", ":"))


class ChinaWealthClient:
    """HTTP client for 中国理财网 (xinxipilu.chinawealth.com.cn).

    Instantiate once and reuse — the session and private key are lazily
    initialised and reused across calls.

    Responses are cached in memory for the current calendar day. The cache key
    is (path, raw_body_string) — the exact string that was signed — so two
    requests that differ only in body content get separate cache entries.
    """

    def __init__(self):
        self._session: Optional[requests.Session] = None
        self._private_key = None
        # {(path, raw_body_str): (date, response_body)}
        self._cache: dict[tuple[str, str], tuple[datetime.date, dict]] = {}

    # ------------------------------------------------------------------
    # Internal

    def _get_session(self) -> requests.Session:
        if self._session is None:
            self._session = requests.Session()
            self._session.headers.update(_HEADERS)
            resp = self._session.post(
                f"{_BASE}/product/getInitData",
                json={},
                timeout=15,
            )
            resp.raise_for_status()
            self._private_key = _load_private_key(resp.json()["data"])
        return self._session

    def _post(self, path: str, body: dict) -> dict:
        raw = _serialize(body)
        today = datetime.date.today()
        key = (path, raw)
        cached_date, cached_body = self._cache.get(key, (None, None))
        if cached_date == today:
            return cached_body

        session = self._get_session()
        sig = _sign(raw, self._private_key)
        resp = session.post(
            f"{_BASE}{path}",
            data=raw,
            headers={"signature": sig},
            timeout=15,
        )
        resp.raise_for_status()
        result = resp.json()
        self._cache[key] = (today, result)
        return result

    # ------------------------------------------------------------------
    # Public API

    def _fetch_basic(self, prod_reg_code: str) -> dict:
        """Return prodBasicInfoVo dict from getProductDetail (cached)."""
        body = self._post(
            "/product/getProductDetail",
            {"prodRegCode": prod_reg_code, "pageNum": 1, "pageSize": 1},
        )
        return (body.get("data") or {}).get("prodBasicInfoVo") or {}

    def get_product_detail(self, prod_reg_code: str) -> dict:
        """Return the raw prodBasicInfoVo dict for the given register code."""
        return self._fetch_basic(prod_reg_code)

    def get_product_info(self, prod_reg_code: str, issuer: str) -> ProductInfo:
        """Return ProductInfo for the given register code.

        NAV fields will be None — use get_latest_price / get_prices_series
        with a specific sub-share code for NAV data.
        Use sub_share_codes() to list available sub-shares.
        """
        basic = self._fetch_basic(prod_reg_code)
        return ProductInfo(
            issuer=issuer,
            product_id=prod_reg_code,
            name=basic.get("prodName", ""),
            register_code=basic.get("prodRegCode"),
            nav=None,
            nav_date=None,
        )

    def sub_share_codes(self, prod_reg_code: str) -> List[str]:
        """Return the list of sub-share codes for a product."""
        basic = self._fetch_basic(prod_reg_code)
        raw = basic.get("subShareCodeStr") or ""
        return [c.strip() for c in raw.split(",") if c.strip()]

    def get_latest_price(
        self,
        prod_reg_code: str,
        sub_share_code: str,
        use_accumulated: bool = False,
    ) -> Optional[SourcePrice]:
        entries = self._fetch_nav_list(prod_reg_code, sub_share_code)
        if not entries:
            return None
        e = entries[-1]  # list is oldest-first after our sort
        ts = datetime.datetime.combine(
            datetime.date.fromisoformat(e["netValueDate"]), datetime.time(), tzinfo=_TZ
        )
        nav_val = e["acumltNetVal"] if use_accumulated else e["shareNetVal"]
        return SourcePrice(price=Decimal(nav_val), time=ts, quote_currency="CNY")

    def get_prices_series(
        self,
        prod_reg_code: str,
        sub_share_code: str,
        time_begin: datetime.datetime,
        time_end: datetime.datetime,
        use_accumulated: bool = False,
    ) -> List[SourcePrice]:
        entries = self._fetch_nav_list(prod_reg_code, sub_share_code)
        result = []
        for e in entries:
            ts = datetime.datetime.combine(
                datetime.date.fromisoformat(e["netValueDate"]), datetime.time(), tzinfo=_TZ
            )
            if time_begin <= ts <= time_end:
                nav_val = e["acumltNetVal"] if use_accumulated else e["shareNetVal"]
                result.append(SourcePrice(
                    price=Decimal(nav_val),
                    time=ts,
                    quote_currency="CNY",
                ))
        return result  # already sorted oldest-first

    def get_nav_series(
        self,
        prod_reg_code: str,
        sub_share_code: str,
        time_begin: datetime.datetime,
        time_end: datetime.datetime,
    ) -> List[NavEntry]:
        entries = self._fetch_nav_list(prod_reg_code, sub_share_code)
        result = []
        for e in entries:
            ts = datetime.datetime.combine(
                datetime.date.fromisoformat(e["netValueDate"]), datetime.time(), tzinfo=_TZ
            )
            if time_begin <= ts <= time_end:
                accumulated = e.get("acumltNetVal")
                result.append(NavEntry(
                    date=ts.date(),
                    nav=Decimal(e["shareNetVal"]),
                    accumulated_nav=Decimal(accumulated) if accumulated else None,
                    currency="CNY",
                ))
        return result  # already sorted oldest-first

    def _fetch_nav_list(self, prod_reg_code: str, sub_share_code: str) -> List[dict]:
        """Fetch NAV entries for one sub-share, sorted oldest-first."""
        body = self._post(
            "/product/getNetValueList",
            {
                "prodRegCode": prod_reg_code,
                "subShareCode": sub_share_code,
                "timeType": "1",
                "pageNum": 1,
                "pageSize": _NAV_PAGE_SIZE,
            },
        )
        if body.get("code") != 200:
            return []
        entries = (body.get("data") or {}).get("list") or []
        # API returns newest-first; reverse for chronological order
        return list(reversed(entries))
