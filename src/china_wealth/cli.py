"""CLI for fetching wealth product prices.

Usage:
  uv run python -m china_wealth.cli info   citic AF233364A
  uv run python -m china_wealth.cli info   pingan LHCZGS2100141A
  uv run python -m china_wealth.cli info   ccb 9783965
  uv run python -m china_wealth.cli nav    citic AF233364A
  uv run python -m china_wealth.cli nav    schroder-bocom Z7007024000248
  uv run python -m china_wealth.cli lookup Z7007024000248
"""

import datetime
import sys
from zoneinfo import ZoneInfo

from china_wealth.sources import get_source
from china_wealth.chinawealth import ChinaWealthClient

_TZ = ZoneInfo("Asia/Shanghai")


def _usage():
    print("Usage: china-wealth <command> [<issuer>] <product_id>", file=sys.stderr)
    print("  Commands:", file=sys.stderr)
    print("    info   <issuer> <product_id>  — product metadata and latest NAV", file=sys.stderr)
    print("    nav    <issuer> <product_id>  — full NAV history (single request)", file=sys.stderr)
    print("    lookup <register_code>        — look up any product by CBIRC register code", file=sys.stderr)
    print("  e.g.  china-wealth info   citic AF233364A", file=sys.stderr)
    print("        china-wealth nav    schroder-bocom Z7007024000248", file=sys.stderr)
    print("        china-wealth lookup Z7007024000248", file=sys.stderr)


def _get_source(issuer: str):
    try:
        return get_source(issuer)
    except ValueError as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


def _print_info(info):
    print(f"Issuer:        {info.issuer}")
    print(f"Product ID:    {info.product_id}")
    print(f"Name:          {info.name}")
    print(f"Register code: {info.register_code or '(not available)'}")
    if info.nav is not None:
        print(f"Unit NAV:      {info.nav} {info.currency}  ({info.nav_date})")
        if info.accumulated_nav is not None:
            print(f"Accum. NAV:    {info.accumulated_nav} {info.currency}")
    else:
        print("Latest NAV:    (not available)")


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
        print("(history not supported by this issuer; showing latest NAV only)")
    else:
        print("(not available)")


def cmd_info(issuer: str, product_id: str):
    source = _get_source(issuer)
    info = source.get_product_info(product_id)
    _print_info(info)


def cmd_nav(issuer: str, product_id: str):
    source = _get_source(issuer)
    begin = datetime.datetime(2000, 1, 1, tzinfo=_TZ)
    end = datetime.datetime(2099, 12, 31, tzinfo=_TZ)
    entries = source.get_nav_series(product_id, begin, end)
    latest = None if entries is not None else source.get_latest_price(product_id)
    _print_nav_series(entries, latest)


def cmd_lookup(register_code: str):
    """Look up any product by CBIRC register code via 中国理财网."""
    client = ChinaWealthClient()
    b = client.get_product_detail(register_code)

    def _f(key, label, default="(不适用)"):
        v = b.get(key)
        print(f"  {label:<12} {v if v else default}")

    print(f"产品名称 Name:           {b.get('prodName', '')}")
    print(f"登记编码 Register code:  {register_code}")
    print(f"发行机构 Issuer:         {b.get('orgName', '')}")
    print(f"起始日期 Start date:     {b.get('prodSdate', '')}")
    print(f"结束日期 End date:       {b.get('prodEdate', '')}")
    print()
    print("基本信息 Product details:")
    _f("prodOperateModeName",   "运作模式 Operation mode")
    _f("prodRiskLevelName",     "风险等级 Risk level")
    _f("prodCollectMethName",   "募集方式 Collection method")
    _f("collCcyName",           "募集币种 Currency")
    _f("prodInvestNatureName",  "投资性质 Asset type")
    print()
    print("业绩比较基准 Performance benchmark:")
    floor = b.get("performanceCompareBaseFloor")
    cap   = b.get("performanceCompareBaseCap")
    rmk   = b.get("performanceCompareBaseRmk")
    if floor or cap:
        range_str = f"{floor}% – {cap}%" if floor and cap else f"{floor or cap}%"
        print(f"  {range_str}")
    if rmk:
        print(f"  {rmk}")
    if not floor and not cap and not rmk:
        print("  (不适用 not available)")
    print()
    sub_shares = client.sub_share_codes(register_code)
    print(f"份额代码 Sub-share codes:  {', '.join(sub_shares) if sub_shares else '(无 none)'}")
    if sub_shares:
        print(f"  (ticker: {register_code}/<sub_share_code>)")


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
        issuer, product_id = sys.argv[2], sys.argv[3]
        if command == "info":
            cmd_info(issuer, product_id)
        else:
            cmd_nav(issuer, product_id)

    else:
        print(f"Error: unknown command '{command}'", file=sys.stderr)
        _usage()
        sys.exit(1)


if __name__ == "__main__":
    main()
