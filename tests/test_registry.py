"""Basic smoke tests for source registry and interface compliance."""

import pytest
from china_wealth.sources import get_source
from china_wealth.source import BaseSource


@pytest.mark.parametrize("issuer", ["citic", "pingan", "ccb"])
def test_get_source_returns_base_source(issuer):
    src = get_source(issuer)
    assert isinstance(src, BaseSource)
    assert src.issuer == issuer


def test_unknown_issuer_raises():
    with pytest.raises(ValueError, match="Unknown issuer"):
        get_source("unknown_bank")
