"""Basic smoke tests for source registry and interface compliance."""

import pytest
from china_wealth.sources import get_source
from china_wealth.source import BaseSource


@pytest.mark.parametrize("source", ["citic_wm", "pingan_bank", "ccb_wm", "cmb", "chinawealth"])
def test_get_source_returns_base_source(source):
    src = get_source(source)
    assert isinstance(src, BaseSource)
    assert src.source == source


def test_unknown_source_raises():
    with pytest.raises(ValueError, match="Unknown source"):
        get_source("unknown_bank")
