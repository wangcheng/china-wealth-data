"""Registry of issuer sources."""

from china_wealth.sources.citic import CiticSource
from china_wealth.sources.pingan import PinganSource
from china_wealth.sources.ccb import CcbSource

_SOURCES = {
    "citic": CiticSource,
    "pingan": PinganSource,
    "ccb": CcbSource,
}


def get_source(issuer: str):
    """Return an instantiated source for the given issuer name."""
    issuer = issuer.lower()
    if issuer not in _SOURCES:
        raise ValueError(f"Unknown issuer '{issuer}'. Available: {list(_SOURCES)}")
    return _SOURCES[issuer]()
