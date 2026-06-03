"""CLI for fetching wealth product prices.

Usage:
  uv run python -m china_wealth.cli info   citic_wm AF233364A
  uv run python -m china_wealth.cli info   pingan_bank LHCZGS2100141A
  uv run python -m china_wealth.cli info   ccb_wm 9783965
  uv run python -m china_wealth.cli nav    citic_wm AF233364A
  uv run python -m china_wealth.cli nav    chinawealth Z7007024000248/182481005A
  uv run python -m china_wealth.cli lookup Z7007024000248
"""

import datetime
import sys
from zoneinfo import ZoneInfo

from china_wealth.sources import get_source
from china_wealth.chinawealth import ChinaWealthClient

_TZ = ZoneInfo("Asia/Shanghai")


def _usage():
    print("Usage: china-wealth <command> [<source>] <ticker>", file=sys.stderr)
    print("  Commands:", file=sys.stderr)
    print("    info   <source> <ticker>  — product metadata and latest NAV", file=sys.stderr)
    print("    nav    <source> <ticker>  — full NAV history (single request)", file=sys.stderr)
    print("    lookup <register_code>    — look up any product by CBIRC register code", file=sys.stderr)
    print("  e.g.  china-wealth info   citic_wm AF233364A", file=sys.stderr)
    print("        china-wealth nav    chinawealth Z7007024000248/182481005A", file=sys.stderr)
    print("        china-wealth lookup Z7007024000248", file=sys.stderr)


def _get_source(source: str):
    try:
        return get_source(source)
    except ValueError as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


def _print_info(info):
    print(f"Source:        {info.source}")
    print(f"Ticker:        {info.ticker}")
    print(f"Name:          {info.name}")
    print(f"Register code: {info.register_code or '(not available)'}")
    if info.nav is not None:
        print(f"Unit NAV:      {info.nav} {info.currency}  ({info.nav_date})")
        if info.accumulated_nav is not None:
            print(f"Accum. NAV:    {info.accumulated_nav} {info.currency}")
    else:
        print(f"Latest NAV:    (not available — run: china-wealth nav {info.source} {info.ticker})")


def _print_nav_series(entries, latest_fallback=None):
    """Print a list of NavEntry, or fall back to a single SourcePrice."""
    if entries is not None:
        if not entries:
            print("(no NAV history returned)")
            return
        has_accum = any(e.accumulated_nav is not None for e in entries)
        if has_accum:
            print(f"{'Date':<12}  {'Unit NAV':>12}  {'Accum. NAV':>12}  Currency")
            print("-" * 48)
            for e in entries:
                accum = f"{e.accumulated_nav:>12}" if e.accumulated_nav is not None else f"{'—':>12}"
                print(f"{str(e.date):<12}  {e.nav:>12}  {accum}  {e.currency}")
        else:
            print(f"{'Date':<12}  {'Unit NAV':>12}  Currency")
            print("-" * 34)
            for e in entries:
                print(f"{str(e.date):<12}  {e.nav:>12}  {e.currency}")
        return

    # Fallback: source doesn't support history — show latest SourcePrice only.
    if latest_fallback:
        date_str = latest_fallback.time.strftime("%Y-%m-%d") if latest_fallback.time else "?"
        print(f"{'Date':<12}  {'Unit NAV':>12}  Currency")
        print("-" * 34)
        print(f"{date_str:<12}  {latest_fallback.price:>12}  {latest_fallback.quote_currency or ''}")
    else:
        print("(not available)")


def cmd_info(source: str, ticker: str):
    src = _get_source(source)
    info = src.get_product_info(ticker)
    _print_info(info)


def cmd_nav(source: str, ticker: str):
    src = _get_source(source)
    begin = datetime.datetime(2000, 1, 1, tzinfo=_TZ)
    end = datetime.datetime(2099, 12, 31, tzinfo=_TZ)
    entries = src.get_nav_series(ticker, begin, end)
    latest = None if entries is not None else src.get_latest_price(ticker)
    _print_nav_series(entries, latest)


def cmd_lookup(register_code: str):
    """Look up any product by CBIRC register code via 中国理财网."""
    client = ChinaWealthClient()
    p = client.get_product_info(register_code)

    def _v(val, default="(不适用)"):
        return val if val else default

    print(f"产品名称 Name:              {p.name}")
    print(f"登记编码 Register code:     {p.register_code}")
    print(f"发行机构 Issuer:            {p.issuer}")
    print(f"起始日期 Start date:        {_v(p.start_date)}")
    print(f"结束日期 End date:          {_v(p.end_date)}")
    print(f"运作模式 Operation mode:    {_v(p.operation_mode)}")
    print(f"风险等级 Risk level:        {_v(p.risk_level)}")
    print(f"募集方式 Collection method: {_v(p.collection_method)}")
    print(f"募集币种 Currency:          {_v(p.currency)}")
    print(f"投资性质 Asset type:        {_v(p.asset_type)}")
    print(f"NAV data on chinawealth?:   {'Y' if p.has_nav else 'N'}")
    sub_shares = p.sub_share_codes
    print(f"份额代码 Sub-share codes:")
    if sub_shares:
        for code in sub_shares:
            print(f"  {code}")
    else:
        print("  (none)")
    if sub_shares and p.has_nav:
        print(f"  运行: china-wealth nav chinawealth {register_code}/<份额代码>")


def main():
    if len(sys.argv) < 2:
        _usage()
        sys.exit(1)

    command = sys.argv[1]

    if command == "lookup":
        if len(sys.argv) != 3:
            print("Usage: china-wealth lookup <register_code>", file=sys.stderr)
            sys.exit(1)
        cmd_lookup(sys.argv[2])

    elif command in ("info", "nav"):
        if len(sys.argv) != 4:
            _usage()
            sys.exit(1)
        source, ticker = sys.argv[2], sys.argv[3]
        if command == "info":
            cmd_info(source, ticker)
        else:
            cmd_nav(source, ticker)

    else:
        print(f"Error: unknown command '{command}'", file=sys.stderr)
        _usage()
        sys.exit(1)


if __name__ == "__main__":
    main()
