"""CCB (建设银行) wealth product price source.

Products sold through CCB (www2.ccb.com). Ticker is the product code
`IvsmPd_ECD` (e.g. `JXLXZD180D121003A`).

API endpoint (GET, no auth):
  https://www2.ccb.com/tran/WCCMainPlatV5
  TXCODE=NLCQ11, filter by IvsmPd_ECD=<ticker>

NAV fields in response (`PROD_INFO_GRP[0]`):
  IvsmPd_ECD       product code (= ticker)
  Fnd_Nm           product name
  Co_Nm            issuer name
  Unit_Ast_NetVal  unit NAV (string)
  NetVal_Dt        NAV date (YYYYMMDD)
  Txn_Mkt_ID       market ID (needed for NAV history URL)
  FndCo_Agnc_Sale_InsID  institution ID (needed for NAV history URL)

NAV history (TXCODE=NLCZST + static .txt file):
  Step 1: GET NLCZST with IvsmPd_ECD, Txn_Mkt_ID, FndCo_Agnc_Sale_InsID,
          PD_Grp_ECD=40, Ctrl_Ind_Cgy=09 → {"result":"y"} if available
  Step 2: GET /newsinfo/finance/<IvsmPd_ECD><Txn_Mkt_ID><FndCo_Agnc_Sale_InsID>4009.txt
          → {"Index_Group": [{"Qtn_Dt": "YYYYMMDD", "Exp_YldRto": "1.01234"}, ...]}

Register code is not exposed by this API; `register_code` is always None.
"""

import datetime
from decimal import Decimal
from typing import List, Optional
from zoneinfo import ZoneInfo

import requests

from china_wealth.http import legacy_tls_session
from china_wealth.source import BaseSource, SourcePrice
from china_wealth.types import NavEntry, ProductShareInfo

_TZ = ZoneInfo("Asia/Shanghai")
_BASE = "https://www2.ccb.com/tran/WCCMainPlatV5"
_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"
    ),
    "Accept": "application/json, text/javascript, */*; q=0.01",
    "Referer": "https://www2.ccb.com/chn/finance/products/self/product_list.shtml",
    "X-Requested-With": "XMLHttpRequest",
}
_BASE_PARAMS = {
    "CCB_IBSVersion": "V5",
    "SERVLET_NAME": "WCCMainPlatV5",
    "TXCODE": "NLCQ11",
    "Fcn_Cd": "0",
    "REC_IN_PAGE": "1",
    "PAGE_JUMP": "1",
    "Sel_StCd": "9",
    "Txn_BO_ID": "110000000",
    "Chnl_ID": "10060009",
    "FndCo_Agnc_Sale_InsID": "005",
    "Crt_Chnl_ID": "9999999999",
    "PD_Sl_Obj_Cd": "01",
    "Bkstg_PD_Tp_ECD": "01",
}


def _fetch_product(ticker: str) -> dict:
    params = {**_BASE_PARAMS, "IvsmPd_ECD": ticker}
    resp = legacy_tls_session().get(_BASE, params=params, headers=_HEADERS, timeout=15)
    resp.raise_for_status()
    data = resp.json()
    products = data.get("PROD_INFO_GRP") or []
    if not products:
        raise ValueError(f"Product not found: {ticker!r}")
    return products[0]


def _parse_date(s: str) -> Optional[datetime.date]:
    try:
        return datetime.datetime.strptime(s, "%Y%m%d").date()
    except (ValueError, TypeError):
        return None


def _fetch_nav_history(ticker: str, txn_mkt_id: str, fnd_co: str) -> List[dict]:
    """Check availability then fetch the static NAV history .txt file."""
    s = legacy_tls_session()
    check = s.get(_BASE, params={
        "CCB_IBSVersion": "V5",
        "SERVLET_NAME": "WCCMainPlatV5",
        "TXCODE": "NLCZST",
        "IvsmPd_ECD": ticker,
        "Txn_Mkt_ID": txn_mkt_id,
        "FndCo_Agnc_Sale_InsID": fnd_co,
        "PD_Grp_ECD": "40",
        "Ctrl_Ind_Cgy": "09",
    }, headers=_HEADERS, timeout=15)
    check.raise_for_status()
    if check.json().get("result") != "y":
        return []
    filename = f"{ticker}{txn_mkt_id}{fnd_co}4009"
    url = f"https://www2.ccb.com/newsinfo/finance/{filename}.txt"
    resp = s.get(url, headers=_HEADERS, timeout=15)
    resp.raise_for_status()
    return resp.json().get("Index_Group") or []


class CcbSource(BaseSource):
    """Price source for wealth products sold through CCB (建设银行)."""

    @property
    def source(self) -> str:
        return "ccb"

    def get_latest_price(self, ticker: str) -> Optional[SourcePrice]:
        product = _fetch_product(ticker)
        nav_str = product.get("Unit_Ast_NetVal")
        if not nav_str:
            return None
        nav_date = _parse_date(product.get("NetVal_Dt", ""))
        ts = (
            datetime.datetime.combine(nav_date, datetime.time(15, 0), tzinfo=_TZ)
            if nav_date
            else None
        )
        return SourcePrice(price=Decimal(nav_str), time=ts, quote_currency="CNY")

    def get_product_info(self, ticker: str) -> ProductShareInfo:
        product = _fetch_product(ticker)
        nav_str = product.get("Unit_Ast_NetVal")
        nav_date = _parse_date(product.get("NetVal_Dt", ""))
        return ProductShareInfo(
            source=self.source,
            ticker=ticker,
            name=product.get("Fnd_Nm", ""),
            register_code=None,
            nav=Decimal(nav_str) if nav_str else None,
            nav_date=nav_date,
            accumulated_nav=None,
        )

    def get_nav_series(
        self,
        ticker: str,
        time_begin: datetime.datetime,
        time_end: datetime.datetime,
    ) -> Optional[List[NavEntry]]:
        product = _fetch_product(ticker)
        txn_mkt_id = product.get("Txn_Mkt_ID", "")
        # FndCo_Agnc_Sale_InsID is a channel constant, not in the product response
        fnd_co = _BASE_PARAMS["FndCo_Agnc_Sale_InsID"]
        entries = _fetch_nav_history(ticker, txn_mkt_id, fnd_co)
        if not entries:
            return None
        result = []
        for e in entries:
            d = _parse_date(e.get("Qtn_Dt", ""))
            if d is None:
                continue
            ts = datetime.datetime.combine(d, datetime.time(), tzinfo=_TZ)
            if time_begin <= ts <= time_end:
                nav_str = e.get("Exp_YldRto")
                if not nav_str:
                    continue
                result.append(NavEntry(
                    date=d,
                    nav=Decimal(nav_str),
                    accumulated_nav=None,
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
                time=datetime.datetime.combine(e.date, datetime.time(15, 0), tzinfo=_TZ),
                quote_currency=e.currency,
            )
            for e in entries
        ]


Source = CcbSource  # beanprice expects module.Source()
