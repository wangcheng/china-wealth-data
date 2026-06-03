"""中国理财网 (China Wealth Register) price source.

Uses ChinaWealthClient as the data backend. Any issuer whose products are
registered on xinxipilu.chinawealth.com.cn can be accessed via this source.

Ticker format: "<register_code>/<sub_share_code>"
  e.g. "Z7007024000248/182481005A"

Run `china-wealth lookup <register_code>` to see available sub-share codes.

bean-price price field: set USE_ACCUMULATED_NAV = True to report accumulated
NAV instead of unit NAV to beancount (useful when reinvested distributions
make accumulated NAV the better cost basis).
"""

import datetime
from typing import List, Optional

from china_wealth.source import BaseSource, SourcePrice
from china_wealth.chinawealth import ChinaWealthClient
from china_wealth.types import NavEntry, ProductShareInfo

# Set to True to report accumulated NAV (累计净值) to bean-price instead of
# unit NAV (单位净值). Both values are always shown in `china-wealth nav`.
USE_ACCUMULATED_NAV = False


def _parse_ticker(ticker: str) -> tuple[str, str]:
    parts = ticker.split("/", 1)
    if len(parts) != 2 or not parts[0] or not parts[1]:
        raise ValueError(
            f"Invalid ticker '{ticker}'. Expected '<register_code>/<sub_share_code>', "
            "e.g. 'Z7007024000248/182481005A'."
        )
    return parts[0], parts[1]


class ChinaWealthSource(BaseSource):
    """Price source for products on 中国理财网 (xinxipilu.chinawealth.com.cn)."""

    def __init__(self):
        self._client = ChinaWealthClient()

    @property
    def source(self) -> str:
        return "chinawealth"

    def get_latest_price(self, ticker: str) -> Optional[SourcePrice]:
        reg_code, sub_share = _parse_ticker(ticker)
        return self._client.get_latest_price(reg_code, sub_share, use_accumulated=USE_ACCUMULATED_NAV)

    def get_product_info(self, ticker: str) -> ProductShareInfo:
        reg_code, sub_share = _parse_ticker(ticker)
        info = self._client.get_product_info(reg_code)
        return ProductShareInfo(
            source=self.source,
            ticker=ticker,
            name=info.name,
            register_code=info.register_code,
            nav=info.nav,
            nav_date=info.nav_date,
            accumulated_nav=info.accumulated_nav,
            currency=info.currency,
        )

    def get_prices_series(
        self,
        ticker: str,
        time_begin: datetime.datetime,
        time_end: datetime.datetime,
    ) -> Optional[List[SourcePrice]]:
        reg_code, sub_share = _parse_ticker(ticker)
        return self._client.get_prices_series(
            reg_code, sub_share, time_begin, time_end, use_accumulated=USE_ACCUMULATED_NAV
        )

    def get_nav_series(
        self,
        ticker: str,
        time_begin: datetime.datetime,
        time_end: datetime.datetime,
    ) -> Optional[List[NavEntry]]:
        reg_code, sub_share = _parse_ticker(ticker)
        return self._client.get_nav_series(reg_code, sub_share, time_begin, time_end)


Source = ChinaWealthSource  # beanprice expects module.Source()
