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

## Development workflow

This project involves reverse engineering Chinese bank APIs. The developer explores
pages in the browser with DevTools open, captures curl commands and JS snippets, and
the AI helps analyse, probe, and implement.

### Phase 1 — Discovery (developer-led)

The developer creates `docs/<source>/` and drops in everything discovered:

- `README.md` — list page URL, detail page URL, any curl commands captured from
  DevTools Network tab, notes on encryption or signing observed
- `examples/` — raw API responses saved from the browser or curl

**Curl commands must be preserved verbatim in the README, forever.** Never remove,
shorten, or reformat them. They capture headers, cookies, and request bodies that
cannot be reconstructed from the response alone and are essential for re-running
requests later.

### Phase 2 — Analysis (AI-led, interactive)

The AI reads everything in `docs/<source>/` and asks questions before implementing:

- **If the request body looks encrypted or signed**, ask the developer to share the
  relevant JS module(s) from the browser bundle. The developer has DevTools open and
  can copy JS sources directly. If the provided JS references other modules, ask for
  those too — don't guess at key material or algorithms from partial information.
- **Probe the live API** with one-off curl/requests calls to test parameters:
  what pagination params exist, whether date range filtering works, what happens
  with different page sizes, whether search accepts keywords vs codes, etc.
  These probes clarify capability before writing docs or code.
- **Never assume** — if a capability is not confirmed by a real response or a probe,
  document it as **unknown** or **assumed, unverified**. Specifically:
  - Do not claim an API returns "full history" unless a `total` field or the date
    range in the response spans the product's full life.
  - Do not claim pagination works a certain way unless tested.
  - Do not claim a field is always present unless seen in multiple examples.

### Phase 3 — Implementation

Once the API is understood:

1. Create `src/china_wealth/sources/<source>.py` subclassing `BaseSource`.
2. Implement `source` property, `get_latest_price`, and `get_product_info`.
   Historical methods are optional.
3. Add `Source = <ClassName>` at the bottom (required for bean-price).
4. Register in `sources/__init__.py`.

### Phase 4 — Documentation

Update all docs in this order:

1. **`docs/<source>/README.md`** — rewrite using the unified layout (see below).
   Preserve all original curl examples. Mark anything unverified explicitly.
2. **`docs/README.md`** — update the capability matrix (list/search and NAV history
   tables) for the new source.
3. **`README.md`** — add the source to the correct section of the user-facing table
   (bank channel / wealth subsidiary / regulatory registry) with accurate
   搜索 / 详情 / 历史净值 capability columns.
4. **`CLAUDE.md`** — only update if the dev workflow, rules, or methodology changed.

### Source naming convention

Bank distribution channels: short name only, no `_bank` suffix.
`cmb` (not `cmb_bank`), `hsbc` (not `hsbc_bank`), `ccb`, `icbc`, `pingan_bank`.
Wealth management subsidiaries keep the `_wm` suffix: `cmb_wm`, `ccb_wm`, `pingan_wm`, `citic_wm`.

### docs/ layout

Each source has a directory `docs/<source>/` with:

- `README.md` — unified reference following the layout below
- `examples/` — raw API response samples saved from the browser or curl

The top-level `docs/README.md` is a TOC and capability matrix for all sources.
Per-source API details, field names, and quirks live in each source's own README.

Each `docs/<source>/README.md` follows this structure:

```
# <source_key> — <Chinese name> (<English name>)
Source key | Issuers | Ticker format

## Pages
  ### List page   — URL, how to find the ticker
  ### Detail page — URL, where register code appears

## APIs
  ### <Endpoint name> — <METHOD /path>
    Code block with original curl command (verbatim, never remove)
    Simplified request summary (method, URL, body shape)
    Property table:
      | Login required       | Yes / No / Unknown                  |
      | Encryption           | No / Yes — <algo, key source>        |
      | Signing              | No / Yes — <algo, computation steps> |
      | Legacy TLS           | No / Yes                             |
      | Pagination           | <params and behaviour, or Unknown>   |
      | Search by keyword    | Yes — <param> / No / Unknown         |
      | Search by code       | Yes — <param> / No / Unknown         |
      | Arbitrary time range | Yes / No / Unknown                   |
    Response field reference table
    Link to example file in examples/

## Notes
  Quirks, known limitations, items marked as unverified/assumed, TODOs
```

### get_product_info vs get_latest_price

`get_product_info` should make the **minimum number of API calls** needed to return name and register code. Do not fetch NAV inside `get_product_info` unless the source's detail API returns it for free in the same response (e.g. citic_wm, pingan_bank). If NAV requires a separate API call, leave `nav`/`nav_date`/`accumulated_nav` as `None` in `get_product_info` and let `get_latest_price` fetch it independently. Users are directed to use the `nav` command for price data.

### 国密 (GuoMi) cryptography

Some sources encrypt their API request bodies using Chinese national cryptographic standards (国密). Use the **`gmssl`** package (already a project dependency) for all GuoMi algorithms — do not reach for `pycryptodome` or implement them by hand.

```python
from gmssl import sm2, sm3, sm4
```

### Legacy TLS

Some Chinese bank servers require legacy TLS renegotiation disabled in Python 3.10+. Use `legacy_tls_session()` from `china_wealth.http` — it returns a `requests.Session` with `ssl.OP_LEGACY_SERVER_CONNECT` set.
