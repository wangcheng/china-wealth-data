"""Simple CLI for fetching wealth product prices.

Usage:
  uv run python -m china_wealth.cli citic AF233364A
  uv run python -m china_wealth.cli pingan LHCZGS2100141A
  uv run python -m china_wealth.cli ccb 9783965
"""

import sys
from china_wealth.sources import get_source


def main():
    if len(sys.argv) != 3:
        print("Usage: china-wealth <issuer> <product_id>", file=sys.stderr)
        print("       e.g. china-wealth citic AF233364A", file=sys.stderr)
        sys.exit(1)

    issuer, product_id = sys.argv[1], sys.argv[2]

    try:
        source = get_source(issuer)
    except ValueError as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)

    print(f"Fetching {issuer} / {product_id} ...")

    try:
        info = source.get_product_info(product_id)
        print(f"  Name:          {info.name}")
        print(f"  Register code: {info.register_code}")
        print(f"  NAV:           {info.nav} {info.currency}")
        print(f"  NAV date:      {info.nav_date}")
    except Exception as e:
        print(f"  Error fetching product info: {e}", file=sys.stderr)

    try:
        price = source.get_latest_price(product_id)
        if price:
            print(f"  Latest price:  {price.price} {price.quote_currency} @ {price.time}")
        else:
            print("  Latest price:  (not available)")
    except Exception as e:
        print(f"  Error fetching price: {e}", file=sys.stderr)


if __name__ == "__main__":
    main()
