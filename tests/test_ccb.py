"""Tests for CCB source — HTML parsing from server-rendered product pages."""

from decimal import Decimal
from unittest import mock

from china_wealth.sources.ccb import CcbSource, _extract, _parse_date


def _load_example() -> str:
    import pathlib

    example = pathlib.Path(__file__).parent.parent / "docs" / "ccb" / "examples" / "page.html"
    return example.read_text(encoding="utf-8")


def test_parse_product_name():
    html = _load_example()
    name = _extract(
        html, r'<h4[^>]*class="cp-title"[^>]*>\s*([^<]+?)\s*(?:<span>|<)'
    )
    assert name == "建信理财睿鑫固收类最低持有1年产品第3期"


def test_parse_nav_and_date():
    html = _load_example()
    import re

    m = re.search(
        r'<p\s+class="firtst">\s*([0-9.]+)\s*</p>\s*'
        r'<p\s+class="second">\s*最新净值\((\d{4}-\d{2}-\d{2})\)',
        html,
        re.DOTALL,
    )
    assert m is not None
    assert m.group(1) == "1.028568"
    assert m.group(2) == "2026-06-01"


def test_parse_date():
    assert _parse_date("20260601").isoformat() == "2026-06-01"
    assert _parse_date("2026-06-01").isoformat() == "2026-06-01"
    assert _parse_date("2026/06/01").isoformat() == "2026-06-01"
    assert _parse_date("invalid") is None


def test_get_product_info():
    html = _load_example()
    src = CcbSource()
    with mock.patch.object(src, "_fetch_page", return_value=html):
        info = src.get_product_info("9783965")

    assert info.issuer == "ccb"
    assert info.product_id == "9783965"
    assert info.name == "建信理财睿鑫固收类最低持有1年产品第3期"
    assert info.register_code is None  # Not exposed on CCB pages
    assert info.nav == Decimal("1.028568")
    assert info.nav_date.isoformat() == "2026-06-01"
    assert info.currency == "CNY"


def test_get_latest_price():
    html = _load_example()
    src = CcbSource()
    with mock.patch.object(src, "_fetch_page", return_value=html):
        price = src.get_latest_price("9783965")

    assert price is not None
    assert price.price == Decimal("1.028568")
    assert price.quote_currency == "CNY"
    assert price.time is not None
    assert price.time.date().isoformat() == "2026-06-01"


def test_get_latest_price_returns_none_when_no_nav():
    src = CcbSource()
    with mock.patch.object(
        src, "_fetch_page", return_value="<html><body>No NAV here</body></html>"
    ):
        price = src.get_latest_price("0000000")
    assert price is None
