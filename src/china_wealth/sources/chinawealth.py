"""China Wealth (中国理财网 xinxipilu.chinawealth.com.cn) price source.

API endpoints:
  Init (get session private key): POST /product/getInitData  body: {}
  Product detail + NAV history:   POST /product/getProductDetail
    body: {"prodRegCode": "<register_code>", "pageNum": 1, "pageSize": 1}

All POST requests must carry a `signature` header:
  base64(RSA_SHA256_PKCS1v15_sign(JSON.stringify(body), session_private_key))

The ticker passed to this source is the CBIRC register code (登记编码),
e.g. "Z7007024000248".

NAV is taken from productTypeNetValueVo.netValueVoList.list[0].shareNetVal
for the defaultSubShareCode (newest entry first, pageSize=1 is sufficient).
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

from china_wealth.source import BaseSource, SourcePrice
from china_wealth.types import ProductInfo

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


def _load_private_key(pem_oneliner: str):
    """Parse the single-line PEM string returned by getInitData."""
    # The API returns PEM with spaces instead of newlines in the base64 body.
    # Reconstruct proper PEM by re-wrapping the base64 payload at 64 chars.
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


def _sign(body_obj: dict, private_key) -> str:
    """Return base64(SHA256withRSA(JSON.stringify(body)))."""
    body_bytes = json.dumps(body_obj, separators=(",", ":")).encode()
    sig = private_key.sign(body_bytes, padding.PKCS1v15(), hashes.SHA256())
    return base64.b64encode(sig).decode()


class ChinaWealthSource(BaseSource):
    """Price source for China Wealth Register (中国理财网) products."""

    def __init__(self):
        self._session: Optional[requests.Session] = None
        self._private_key = None

    @property
    def issuer(self) -> str:
        return "chinawealth"

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
            pem_str = resp.json()["data"]
            self._private_key = _load_private_key(pem_str)
        return self._session

    def _post(self, path: str, body: dict) -> dict:
        session = self._get_session()
        sig = _sign(body, self._private_key)
        resp = session.post(
            f"{_BASE}{path}",
            data=json.dumps(body, separators=(",", ":")),
            headers={"signature": sig},
            timeout=15,
        )
        resp.raise_for_status()
        return resp.json()

    def _fetch_detail(self, prod_reg_code: str, page_size: int = 1) -> dict:
        return self._post(
            "/product/getProductDetail",
            {"prodRegCode": prod_reg_code, "pageNum": 1, "pageSize": page_size},
        )

    def _parse_latest_nav(self, data: dict) -> tuple[Decimal, datetime.date, str]:
        """Return (nav, nav_date, sub_share_code) from getProductDetail data."""
        ptnv = data["productTypeNetValueVo"]
        default_code = ptnv["defaultSubShareCode"]
        entries = ptnv["netValueVoList"]["list"]

        # entries are newest-first; find the first entry matching defaultSubShareCode
        entry = next(
            (e for e in entries if e["subShareCode"] == default_code),
            entries[0],
        )
        nav = Decimal(entry["shareNetVal"])
        nav_date = datetime.date.fromisoformat(entry["netValueDate"])
        return nav, nav_date, entry["subShareCode"]

    def get_latest_price(self, ticker: str) -> Optional[SourcePrice]:
        body = self._fetch_detail(ticker)
        if body.get("code") != 200:
            return None
        nav, nav_date, _ = self._parse_latest_nav(body["data"])
        nav_dt = datetime.datetime.combine(nav_date, datetime.time(), tzinfo=_TZ)
        return SourcePrice(price=nav, time=nav_dt, quote_currency="CNY")

    def get_product_info(self, product_id: str) -> ProductInfo:
        body = self._fetch_detail(product_id)
        data = body["data"]
        basic = data["prodBasicInfoVo"]
        nav, nav_date, _ = self._parse_latest_nav(data)
        return ProductInfo(
            issuer=self.issuer,
            product_id=product_id,
            name=basic["prodName"],
            register_code=basic["prodRegCode"],
            nav=nav,
            nav_date=nav_date,
        )

    def get_prices_series(
        self,
        ticker: str,
        time_begin: datetime.datetime,
        time_end: datetime.datetime,
    ) -> Optional[List[SourcePrice]]:
        # Fetch more entries for historical range; use a larger pageSize
        body = self._fetch_detail(ticker, page_size=200)
        if body.get("code") != 200:
            return None
        ptnv = body["data"]["productTypeNetValueVo"]
        default_code = ptnv["defaultSubShareCode"]
        entries = ptnv["netValueVoList"]["list"]

        result = []
        for e in entries:
            if e["subShareCode"] != default_code:
                continue
            ts = datetime.datetime.combine(
                datetime.date.fromisoformat(e["netValueDate"]),
                datetime.time(),
                tzinfo=_TZ,
            )
            if time_begin <= ts <= time_end:
                result.append(SourcePrice(
                    price=Decimal(e["shareNetVal"]),
                    time=ts,
                    quote_currency="CNY",
                ))
        return sorted(result, key=lambda p: p.time)


Source = ChinaWealthSource  # beanprice expects module.Source()
