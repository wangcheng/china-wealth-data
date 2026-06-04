# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
uv sync                          # install deps and create .venv
uv run pytest                    # run all tests
uv run pytest tests/test_registry.py::test_unknown_source_raises  # run single test
uv run china-wealth info   <source> <ticker>   # product info + latest NAV
uv run china-wealth nav    <source> <ticker>   # full NAV history
uv run china-wealth lookup <register_code>     # look up any product by CBIRC code
uv run python -m china_wealth.cli info citic_wm AF233364A  # CLI without install
```

## Architecture

This is a `src/` layout Python package (`src/china_wealth/`). The package has two roles:

1. **Python library** — call `get_source(source)` from `china_wealth.sources` to get a source instance, then call `get_latest_price(ticker)` or `get_product_info(ticker)`.
2. **bean-price source** — each source module exposes a `Source` alias at module level so beanprice can do `module.Source()`. The `price:` metadata in a `.beancount` file uses the full module path, e.g. `china_wealth.sources.citic_wm/AF233364A`.

### Key abstractions

- `source.py` — `BaseSource` ABC and `SourcePrice` NamedTuple. `SourcePrice` is intentionally identical to beanprice's own `SourcePrice` so sources are drop-in compatible without requiring beanprice to be installed.
- `types.py` — `ProductInfo` dataclass: richer metadata (name, register code, nav, nav_date) returned by `get_product_info()`. Not part of the beanprice interface. Fields: `source`, `ticker` (not `issuer`/`product_id`).
- `sources/__init__.py` — `get_source(source)` registry, maps source strings to source classes.
- `chinawealth.py` — `ChinaWealthClient`, a low-level HTTP client for 中国理财网. Not a `BaseSource` subclass — used as a backend by `sources/chinawealth.py`. NAV is not guaranteed (many issuers don't publish it). The `lookup` CLI command uses this client directly with a CBIRC register code.

### Source vs issuer

**Source** = the data backend / module key (e.g. `citic_wm`, `pingan_bank`). This is what you pass to `get_source()` and what `BaseSource.source` returns.

**Issuer** = the financial institution that issued the product (e.g. 平安理财, 信银理财). A single source may sell products from multiple issuers (e.g. `pingan_bank` sells products from 平安理财 and others).

## Sources and issuers

| Source key    | Source class        | Data backend                                       | Issuers served                              |
| ------------- | ------------------- | -------------------------------------------------- | ------------------------------------------- |
| `citic_wm`    | `CiticWmSource`     | CITIC API (wechat.citic-wealth.com)                | 中信理财                                    |
| `pingan_bank` | `PinganBankSource`  | Ping An Bank API (rmb.pingan.com.cn)               | 平安理财 + others sold by Ping An Bank      |
| `ccb`         | `CcbSource`         | CCB API (www2.ccb.com)                             | 建信理财 + others sold by CCB               |
| `ccb_wm`      | `CcbWmSource`       | HTML scraping (wealthccb.com)                      | 建信理财                                    |
| `cmb_bank`    | `CmbBankSource`     | CMB Bank API (cfweb.paas.cmbchina.com)             | 建信理财 + others sold by CMB Bank          |
| `chinawealth` | `ChinaWealthSource` | `ChinaWealthClient` (xinxipilu.chinawealth.com.cn) | Any registered issuer (e.g. 交银施罗德理财) |

## Development workflow

When adding or improving a source, the developer writes initial thoughts and
drops example API responses in `docs/<source>/`. The expected flow is:

1. **Developer provides a draft** — `docs/<source>/README.md` with initial notes
   on the API (endpoint, auth, known fields) and one or more example response
   files in `docs/<source>/examples/`.

2. **AI reads the examples carefully** — inspect every field in the response,
   identify the correct fields for NAV, accumulated NAV, date, register code,
   and product name. Don't assume field names match other sources.

3. **AI implements the source** — create or update
   `src/china_wealth/sources/<source>.py`. Extract all available data; if both
   unit NAV and accumulated NAV are present, populate both.

4. **AI updates the docs** — replace the developer's draft in
   `docs/<source>/README.md` with accurate, complete documentation: endpoint
   URLs, request parameters, response field reference table, pagination notes,
   and any quirks discovered during implementation.

### Adding a new source

1. Create `src/china_wealth/sources/<source>.py` subclassing `BaseSource`.
2. Implement `source` property, `get_latest_price`, and `get_product_info`. Historical methods are optional.
3. Add `Source = <ClassName>` at the bottom (required for bean-price).
4. Register in `sources/__init__.py`.

### get_product_info vs get_latest_price

`get_product_info` should make the **minimum number of API calls** needed to return name and register code. Do not fetch NAV inside `get_product_info` unless the source's detail API returns it for free in the same response (e.g. citic_wm, pingan_bank). If NAV requires a separate API call, leave `nav`/`nav_date`/`accumulated_nav` as `None` in `get_product_info` and let `get_latest_price` fetch it independently. Users are directed to use the `nav` command for price data.

### chinawealth source (交银施罗德 and others)

`sources/chinawealth.py` delegates fully to `ChinaWealthClient`. Ticker format is `<register_code>_<sub_share_code>` (e.g. `Z7007024000248_182481005A`). A product may have multiple sub-shares with different NAVs — use `china-wealth lookup <register_code>` to list them. NAV history is fetched via `getNetValueList` (not `getProductDetail`).

### CCB sources

**`ccb`** (`sources/ccb.py`) uses the CCB Bank JSON API (`www2.ccb.com`). Ticker is `IvsmPd_ECD` (e.g. `JXLXZD180D121003A`). NAV history is fetched via a two-step flow: `TXCODE=NLCZST` checks availability, then a static `.txt` file at `/newsinfo/finance/<ticker><Txn_Mkt_ID><FndCo_Agnc_Sale_InsID>4009.txt` is fetched. Register code is not exposed (`None`). Requires legacy TLS (`legacy_tls_session()`).

**`ccb_wm`** (`sources/ccb_wm.py`) is implemented via HTML scraping of wealthccb.com. Product pages use a numeric page slug (`9783965`) that differs from the user-facing product ID. Until a lookup API is found, the slug must be passed directly as the ticker. NAV is extracted from `<p class="firtst">` blocks in the server-rendered HTML. The CBIRC register code is NOT exposed on CCB product pages (returns `None`).

### 国密 (GuoMi) cryptography

Some sources encrypt their API request bodies using Chinese national cryptographic standards (国密). Use the **`gmssl`** package (already a project dependency) for all GuoMi algorithms — do not reach for `pycryptodome` or implement them by hand.

```python
from gmssl import sm2, sm3, sm4
```

Known usage:

- **`pingan_wm`** — SM4 ECB + PKCS#7 (`gmssl.sm4.CryptSM4`)
- **`cmb_bank`** — SM4 ECB for request signing (`gmssl.sm4.CryptSM4`); encrypts `"appId|timespan"` to produce the `signature` header
- **`cmb_wm`** — SM2 asymmetric encryption (`gmssl.sm2.CryptSM2`)

### Legacy TLS

Some Chinese bank servers require legacy TLS renegotiation disabled in Python 3.10+. Use `legacy_tls_session()` from `china_wealth.http` — it returns a `requests.Session` with `ssl.OP_LEGACY_SERVER_CONNECT` set. Currently used by `citic_wm.py` and `ccb.py`. Other sources use plain `requests.get`.

### API response field reference

Key non-obvious field names discovered from real API responses (see `docs/*/README.md`):

| Source            | Register code field    | NAV field                    | NAV date field         |
| ----------------- | ---------------------- | ---------------------------- | ---------------------- |
| citic_wm detail   | `registCode`           | `nav`                        | `navDate` (`YYYYMMDD`) |
| citic_wm nav list | —                      | `data.productNavList[0].nav` | `navDate`              |
| pingan_bank       | `bankFundRegisterCode` | `netValue` (string)          | `navDate` (`YYYYMMDD`) |
| ccb_wm            | N/A (not on page)      | `p.firtst` in 最新净值 block          | `最新净值(YYYY-MM-DD)`  |
| ccb list/detail   | N/A                    | `Unit_Ast_NetVal`                     | `NetVal_Dt` (`YYYYMMDD`) |
| ccb nav history   | —                      | `Index_Group[].Exp_YldRto`            | `Qtn_Dt` (`YYYYMMDD`)  |
| cmb_bank info     | `regCode`              | `netValue` (often empty)              | —                       |
| cmb_bank nav list | —                      | `body.data[].znavVal`                 | `znavDat` (`YYYYMMDD`) |
