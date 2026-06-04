"""Registry of price sources."""

from china_wealth.sources.ccb import CcbSource
from china_wealth.sources.ccb_wm import CcbWmSource
from china_wealth.sources.citic_wm import CiticWmSource
from china_wealth.sources.cmb_bank import CmbBankSource
from china_wealth.sources.cmb_wm import CmbWmSource
from china_wealth.sources.pingan_bank import PinganBankSource
from china_wealth.sources.pingan_wm import PinganWmSource
from china_wealth.sources.chinawealth import ChinaWealthSource
from china_wealth.sources.hsbc_bank import HsbcBankSource
from china_wealth.sources.icbc import IcbcSource

_SOURCES = {
    "citic_wm": CiticWmSource,
    "pingan_bank": PinganBankSource,
    "pingan_wm": PinganWmSource,
    "ccb": CcbSource,
    "ccb_wm": CcbWmSource,
    "cmb_bank": CmbBankSource,
    "cmb_wm": CmbWmSource,
    "chinawealth": ChinaWealthSource,
    "hsbc_bank": HsbcBankSource,
    "icbc": IcbcSource,
}


def get_source(source: str):
    """Return an instantiated source for the given source name."""
    source = source.lower()
    if source not in _SOURCES:
        raise ValueError(f"Unknown source '{source}'. Available: {list(_SOURCES)}")
    return _SOURCES[source]()
