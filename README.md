# china-wealth-data

A Python library for fetching NAV (Net Asset Value) data from Chinese bank wealth management products that are not available through public APIs.

Supported issuers: CITIC (中信理财), Ping An (平安理财), CCB (建信理财).

## Features

- Fetch latest NAV and product metadata (name, registration code) by issuer + product ID
- Historical price series where available
- Compatible as a [bean-price](https://github.com/beancount/beanprice) source for Beancount workflows

## Concepts

Each product is identified by two parts:

- **issuer** — the bank/institution (e.g. `citic`, `pingan`, `ccb`)
- **product_id** — the issuer-specific product code (e.g. `AF233364A`, `LHCZGS2100141A`)

Products also carry a globally unique **register code** (登记编码) assigned by the CBIRC, e.g. `Z7003322000117`.

## Installation

Requires [uv](https://docs.astral.sh/uv/).

```bash
git clone https://github.com/yourname/china-wealth-data
cd china-wealth-data
uv sync
```

## CLI Usage

```bash
uv run china-wealth <issuer> <product_id>
```

Examples:

```bash
uv run china-wealth citic AF233364A
uv run china-wealth pingan LHCZGS2100141A
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

## Python Library Usage

```python
from china_wealth.sources import get_source

source = get_source("citic")
result = source.get_latest_price("AF233364A")
print(result.price)           # Decimal NAV
print(result.time)            # timezone-aware datetime
print(result.quote_currency)  # "CNY"

info = source.get_product_info("AF233364A")
print(info.name)           # product name
print(info.register_code)  # e.g. "Z7002623001159"
```

## bean-price Usage

Add a `price:` metadata directive to your Beancount commodity using the fully-qualified module path:

```beancount
2020-01-01 commodity CITIC_AF233364A
  price: "CNY:china_wealth.sources.citic/AF233364A"

2020-01-01 commodity PINGAN_LHCZGS2100141A
  price: "CNY:china_wealth.sources.pingan/LHCZGS2100141A"
```

Then run:

```bash
uv run bean-price your_file.beancount
```

See [examples/wealth.beancount](examples/wealth.beancount) for a complete example file.

## Supported Issuers

| Issuer           | Module   | ID Example       | Notes                    |
| ---------------- | -------- | ---------------- | ------------------------ |
| CITIC 中信理财   | `citic`  | `AF233364A`      | Latest NAV + history     |
| Ping An 平安理财 | `pingan` | `LHCZGS2100141A` | Latest NAV               |
| CCB 建信理财     | `ccb`    | page slug        | Page slug required (WIP) |

## Project Structure

```
src/china_wealth/
├── __init__.py
├── types.py          # ProductInfo dataclass
├── source.py         # BaseSource abstract class
├── cli.py            # CLI entry point
└── sources/
    ├── __init__.py   # Registry: get_source(issuer)
    ├── citic.py
    ├── pingan.py
    └── ccb.py
```

API documentation and example responses for each issuer are in [docs/](docs/).

## License

MIT
