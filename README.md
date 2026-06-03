# china-wealth-data

A Python library for fetching NAV (Net Asset Value) data from Chinese bank wealth management products that are not available through public APIs.

Supported issuers: CITIC (中信理财), Ping An (平安理财), CCB (建信理财).

## Features

- Fetch latest NAV and product metadata (name, registration code) by issuer + product ID
- Historical price series where available
- Compatible as a [bean-price](https://github.com/beancount/beanprice) source for use in Beancount workflows

## Concepts

Each product is identified by two parts:

- **issuer** — the bank/institution (e.g. `citic`, `pingan`, `ccb`)
- **product_id** — the issuer-specific product code (e.g. `AF233364A`, `LHCZGS2100141A`)

Products also carry a globally unique **register code** (登记编码) assigned by the CBIRC, e.g. `Z7003322000117`. This is useful as a stable cross-system identifier.

## Installation

```bash
pip install china-wealth-data
```

Or install from source:

```bash
git clone https://github.com/yourname/china-wealth-data
cd china-wealth-data
pip install -e .
```

## Python Library Usage

```python
from china_wealth.sources import get_source

source = get_source("citic")
result = source.get_latest_price("AF233364A")
print(result.price)           # Decimal NAV
print(result.time)            # timezone-aware datetime
print(result.quote_currency)  # "CNY"

# Product metadata
info = source.get_product_info("AF233364A")
print(info.name)           # product name
print(info.register_code)  # e.g. "Z7003322000117"
```

## CLI Usage

```bash
china-wealth <issuer> <product_id>
```

Examples:

```bash
china-wealth citic AF233364A
china-wealth pingan LHCZGS2100141A
```

Sample output:

```
Fetching citic / AF233364A ...
  Name:          信银理财安盈象固收稳利日开8号理财产品
  Register code: Z7002623001159
  NAV:           1.0475 CNY
  NAV date:      2026-06-02
  Latest price:  1.0475 CNY @ 2026-06-02 00:00:00+08:00
```

If running from source without installing:

```bash
uv run python -m china_wealth.cli citic AF233364A
```

## bean-price Usage

Use the source string format `china_wealth.sources.<issuer>/<product_id>` in your Beancount commodity directives:

```beancount
2020-01-01 commodity CITIC_AF233364A
  price: "CNY:china_wealth.sources.citic/AF233364A"

2020-01-01 commodity PINGAN_LHCZGS2100141A
  price: "CNY:china_wealth.sources.pingan/LHCZGS2100141A"
```

Then run:

```bash
bean-price your_file.beancount
```

## Supported Issuers

| Issuer           | Module   | ID Example       | Notes                |
| ---------------- | -------- | ---------------- | -------------------- |
| CITIC 中信理财   | `citic`  | `AF233364A`      | Latest NAV + history |
| Ping An 平安理财 | `pingan` | `LHCZGS2100141A` | Latest NAV           |
| CCB 建信理财     | `ccb`    | `AF233364A`      | Uses page slug (WIP) |

## Project Structure

```
src/china_wealth/
├── __init__.py
├── types.py          # ProductInfo, shared types
├── source.py         # BaseSource abstract class
└── sources/
    ├── __init__.py   # Registry: get_source(issuer)
    ├── citic.py
    ├── pingan.py
    └── ccb.py
```

## License

MIT
