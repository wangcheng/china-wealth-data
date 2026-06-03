# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
uv sync                          # install deps and create .venv
uv run pytest                    # run all tests
uv run pytest tests/test_registry.py::test_unknown_issuer_raises  # run single test
uv run china-wealth info   <issuer> <product_id>   # product info + latest NAV
uv run china-wealth nav    <issuer> <product_id>   # full NAV history
uv run china-wealth lookup <register_code>         # look up any product by CBIRC code
uv run python -m china_wealth.cli info citic AF233364A  # CLI without install
```

## Architecture

This is a `src/` layout Python package (`src/china_wealth/`). The package has two roles:

1. **Python library** — call `get_source(issuer)` from `china_wealth.sources` to get a source instance, then call `get_latest_price(product_id)` or `get_product_info(product_id)`.
2. **bean-price source** — each issuer module exposes a `Source` alias at module level so beanprice can do `module.Source()`. The `price:` metadata in a `.beancount` file uses the full module path, e.g. `china_wealth.sources.citic/AF233364A`.

### Key abstractions

- `source.py` — `BaseSource` ABC and `SourcePrice` NamedTuple. `SourcePrice` is intentionally identical to beanprice's own `SourcePrice` so sources are drop-in compatible without requiring beanprice to be installed.
- `types.py` — `ProductInfo` dataclass: richer metadata (name, register code, nav, nav_date) returned by `get_product_info()`. Not part of the beanprice interface.
- `sources/__init__.py` — `get_source(issuer)` registry, maps issuer strings to source classes.
- `chinawealth.py` — `ChinaWealthClient`, a low-level HTTP client for 中国理财网. Not a `BaseSource` subclass — used as a backend by issuers whose products are registered there. NAV is not guaranteed (many issuers don't publish it). The `lookup` CLI command uses this client directly with a CBIRC register code.

## Development workflow

When adding or improving an issuer, the developer writes initial thoughts and
drops example API responses in `docs/<issuer>/`. The expected flow is:

1. **Developer provides a draft** — `docs/<issuer>/README.md` with initial notes
   on the API (endpoint, auth, known fields) and one or more example response
   files in `docs/<issuer>/examples/`.

2. **AI reads the examples carefully** — inspect every field in the response,
   identify the correct fields for NAV, accumulated NAV, date, register code,
   and product name. Don't assume field names match other issuers.

3. **AI implements the source** — create or update
   `src/china_wealth/sources/<issuer>.py`. Extract all available data; if both
   unit NAV and accumulated NAV are present, populate both.

4. **AI updates the docs** — replace the developer's draft in
   `docs/<issuer>/README.md` with accurate, complete documentation: endpoint
   URLs, request parameters, response field reference table, pagination notes,
   and any quirks discovered during implementation.

### Adding a new issuer

1. Create `src/china_wealth/sources/<issuer>.py` subclassing `BaseSource`.
2. Implement `issuer`, `get_latest_price`, and `get_product_info`. Historical methods are optional.
3. Add `Source = <ClassName>` at the bottom (required for bean-price).
4. Register in `sources/__init__.py`.

### Schroder BOCOM (施罗德交银)

`sources/schroder_bocom.py` delegates fully to `ChinaWealthClient`. Ticker format is `<register_code>/<sub_share_code>` (e.g. `Z7007024000248/182481005A`). A product may have multiple sub-shares with different NAVs — use `china-wealth lookup <register_code>` to list them. NAV history is fetched via `getNetValueList` (not `getProductDetail`).

### CCB status

CCB (`sources/ccb.py`) is implemented via HTML scraping. CCB product pages use a numeric page slug (`9783965`) that differs from the user-facing product ID. Until a lookup API is found, the slug must be passed directly as the ticker. NAV is extracted from `<p class="firtst">` blocks in the server-rendered HTML. The CBIRC register code is NOT exposed on CCB product pages (returns `None`).

### CITIC SSL

CITIC's server requires legacy TLS renegotiation disabled in Python 3.10+. `citic.py` uses a custom `_LegacyTLSAdapter` with `ssl.OP_LEGACY_SERVER_CONNECT` mounted on every session. Other issuers use plain `requests.get`.

### API response field reference

Key non-obvious field names discovered from real API responses (see `docs/*/README.md`):

| Issuer         | Register code field    | NAV field                    | NAV date field         |
| -------------- | ---------------------- | ---------------------------- | ---------------------- |
| CITIC detail   | `registCode`           | `nav`                        | `navDate` (`YYYYMMDD`) |
| CITIC nav list | —                      | `data.productNavList[0].nav` | `navDate`              |
| Ping An        | `bankFundRegisterCode` | `netValue` (string)          | `navDate` (`YYYYMMDD`) |
| CCB            | N/A (not on page)      | `p.firtst` in 最新净值 block | `最新净值(YYYY-MM-DD)` |
