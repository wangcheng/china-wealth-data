"""Abstract base class for all price sources.

Each source implements the beanprice Source interface so it can be used
directly with bean-price, plus a get_product_info method for richer metadata.
"""

import datetime
from abc import ABC, abstractmethod
from decimal import Decimal
from typing import List, Optional, NamedTuple

from china_wealth.types import NavEntry, ProductShareInfo


# Matches beanprice's SourcePrice NamedTuple exactly so sources are drop-in
# compatible with bean-price without requiring beanprice to be installed.
SourcePrice = NamedTuple(
    "SourcePrice",
    [
        ("price", Decimal),
        ("time", Optional[datetime.datetime]),
        ("quote_currency", Optional[str]),
    ],
)


class BaseSource(ABC):
    """Base class for wealth product price sources.

    Subclasses must implement get_latest_price and get_product_info.
    Historical methods are optional — return None if not supported.

    The ticker string passed by bean-price identifies the product
    (e.g. "AF233364A" for citic_wm, "<register_code>_<sub_share_code>" for chinawealth).
    """

    @property
    @abstractmethod
    def source(self) -> str:
        """Short identifier for the source, e.g. 'citic_wm'."""

    @abstractmethod
    def get_latest_price(self, ticker: str) -> Optional[SourcePrice]:
        """Return the most recent NAV for the given ticker."""

    @abstractmethod
    def get_product_info(self, ticker: str) -> ProductShareInfo:
        """Return share-level metadata including name, register code, and latest NAV."""

    def get_historical_price(
        self, ticker: str, time: datetime.datetime
    ) -> Optional[SourcePrice]:
        """Return NAV at or before the given date. Override if supported."""
        return None

    def get_prices_series(
        self,
        ticker: str,
        time_begin: datetime.datetime,
        time_end: datetime.datetime,
    ) -> Optional[List[SourcePrice]]:
        """Return NAV series between two dates. Override if supported."""
        return None

    def get_nav_series(
        self,
        ticker: str,
        time_begin: datetime.datetime,
        time_end: datetime.datetime,
    ) -> Optional[List[NavEntry]]:
        """Return richer NAV series including accumulated NAV where available.

        Override if the source can provide accumulated NAV. The default
        implementation falls back to get_prices_series with accumulated_nav=None.
        """
        series = self.get_prices_series(ticker, time_begin, time_end)
        if series is None:
            return None
        return [
            NavEntry(
                date=p.time.date() if p.time else None,
                nav=p.price,
                accumulated_nav=None,
                currency=p.quote_currency or "CNY",
            )
            for p in series
        ]
