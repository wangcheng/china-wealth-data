"""Schroder BOCOM Wealth (施罗德交银理财) price source.

Uses 中国理财网 (ChinaWealthClient) as the data backend.

Ticker format: "<register_code>/<sub_share_code>"
  e.g. "Z7007024000248/182481005A"

Run `china-wealth lookup <register_code>` to see available sub-share codes.
施罗德交银 consistently publishes NAV on 中国理财网.

bean-price price field: set USE_ACCUMULATED_NAV = True to report accumulated
NAV instead of unit NAV to beancount (useful when reinvested distributions
make accumulated NAV the better cost basis).
"""

import datetime
from typing import List, Optional

from china_wealth.source import BaseSource, SourcePrice
from china_wealth.chinawealth import ChinaWealthClient
from china_wealth.types import NavEntry, ProductInfo

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


class SchroderBocomSource(BaseSource):
    """Price source for Schroder BOCOM Wealth (施罗德交银理财) products."""

    def __init__(self):
        self._client = ChinaWealthClient()

    @property
    def issuer(self) -> str:
        return "schroder-bocom"

    def get_latest_price(self, ticker: str) -> Optional[SourcePrice]:
        reg_code, sub_share = _parse_ticker(ticker)
        return self._client.get_latest_price(reg_code, sub_share, use_accumulated=USE_ACCUMULATED_NAV)

    def get_product_info(self, product_id: str) -> ProductInfo:
        reg_code, sub_share = _parse_ticker(product_id)
        info = self._client.get_product_info(reg_code, issuer=self.issuer)
        info.product_id = product_id
        return info

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


Source = SchroderBocomSource  # beanprice expects module.Source()
