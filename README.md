# china-wealth-data

A Python library and CLI for fetching NAV (Net Asset Value) data from Chinese bank wealth management products.

Supported issuers: CITIC (中信理财), Ping An (平安理财), CCB (建信理财), Schroder BOCOM (施罗德交银理财).

## Features

- Fetch latest NAV and product metadata (name, registration code) by issuer + product ID
- Historical NAV series where available
- Look up any product by CBIRC register code (登记编码) via 中国理财网
- Compatible as a [bean-price](https://github.com/beancount/beanprice) source for Beancount workflows

## Installation

Requires [uv](https://docs.astral.sh/uv/).

```bash
git clone https://github.com/yourname/china-wealth-data
cd china-wealth-data
uv sync
```

## CLI Usage

### `info` — product metadata and latest NAV

```bash
uv run china-wealth info <issuer> <product_id>
```

```bash
uv run china-wealth info citic AF233364A
uv run china-wealth info pingan LHCZGS2100141A
uv run china-wealth info schroder-bocom Z7007024000248/182481005A
```

### `nav` — NAV history

```bash
uv run china-wealth nav <issuer> <product_id>
```

```bash
uv run china-wealth nav citic AF233364A
uv run china-wealth nav schroder-bocom Z7007024000248/182481005A
```

Sample output:

```
Date            NAV  Currency
----------------------------------
2026-05-20   1.0373  CNY
2026-05-21   1.0374  CNY
...
```

### `lookup` — look up any product by CBIRC register code

Queries 中国理财网 directly. NAV is not guaranteed — many issuers do not publish NAV there.

```bash
uv run china-wealth lookup Z7007024000248
```

Sample output:

```
产品名称 Name:           施罗德交银理财得润固收添益日日开2号理财产品
登记编码 Register code:  Z7007024000248
发行机构 Issuer:         施罗德交银理财有限公司
起始日期 Start date:     2024/08/15
结束日期 End date:       2099/12/31

基本信息 Product details:
  运作模式 Operation mode     开放式净值型
  风险等级 Risk level         二级(中低)
  募集方式 Collection method  公募
  募集币种 Currency           人民币(CNY)
  投资性质 Asset type         固定收益类

业绩比较基准 Performance benchmark:
  1.46% – 2.51%
  20260212调整业绩比较基准上限为2.51%，下限为1.46%。

份额代码 Sub-share codes:  182481005A, 182481005B
  (ticker: Z7007024000248/<sub_share_code>)
```

## Python Library Usage

```python
from china_wealth.sources import get_source

source = get_source("citic")

# Latest NAV
result = source.get_latest_price("AF233364A")
print(result.price)           # Decimal NAV
print(result.time)            # timezone-aware datetime
print(result.quote_currency)  # "CNY"

# Product metadata
info = source.get_product_info("AF233364A")
print(info.name)           # product name
print(info.register_code)  # e.g. "Z7002623001159"
```

For Schroder BOCOM, the ticker includes the sub-share code:

```python
source = get_source("schroder-bocom")
result = source.get_latest_price("Z7007024000248/182481005A")
```

## bean-price Usage

Add a `price:` metadata directive to your Beancount commodity using the fully-qualified module path:

```beancount
2020-01-01 commodity CITIC_AF233364A
  price: "CNY:china_wealth.sources.citic/AF233364A"

2020-01-01 commodity SCHRODER_BOCOM
  price: "CNY:china_wealth.sources.schroder_bocom/Z7007024000248/182481005A"
```

Then run:

```bash
uv run bean-price your_file.beancount
```

## Supported Issuers

| Issuer                        | Key              | Product ID format                  | NAV history          |
| ----------------------------- | ---------------- | ---------------------------------- | -------------------- |
| CITIC 中信理财                | `citic`          | `AF233364A`                        | Yes                  |
| Ping An 平安理财              | `pingan`         | `LHCZGS2100141A`                   | No                   |
| CCB 建信理财                  | `ccb`            | numeric page slug (e.g. `9783965`) | No                   |
| Schroder BOCOM 施罗德交银理财 | `schroder-bocom` | `<register_code>/<sub_share_code>` | Yes (10 most recent) |

## Project Structure

```
src/china_wealth/
├── __init__.py
├── types.py           # ProductInfo dataclass
├── source.py          # BaseSource abstract class + SourcePrice
├── chinawealth.py     # ChinaWealthClient (中国理财网 HTTP client)
├── cli.py             # CLI entry point
└── sources/
    ├── __init__.py        # Registry: get_source(issuer)
    ├── citic.py
    ├── pingan.py
    ├── ccb.py
    └── schroder_bocom.py  # delegates to ChinaWealthClient
```

API documentation and example responses for each issuer are in [docs/](docs/).

## License

MIT
