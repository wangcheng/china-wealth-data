# CITIC Wealth (中信理财)

## Overview

CITIC Wealth (信银理财) is the wealth management subsidiary of China CITIC Bank (中信银行).
Products are identified by a `prodCode` such as `AF233364A`.

## Finding a Product

The product list page is at:

```
https://www.citic-wealth.com/wechat/product/#/productMarket
```

The product detail page URL contains the `fundCode` query parameter:

```
https://www.citic-wealth.com/wechat/product/#/productMarketDetailWeb?fundCode=<prodCode>&productType=1&navDecimalPlaces=
```

The `fundCode` value (e.g. `AF265283K`) is the same `prodCode` used by all API calls below.

The CBIRC register code (登记编码) is returned by the detail API as `registCode`. It also appears in the product's 产品基本信息 section and 产品说明书 PDF.

## API Endpoints

Base URL: `https://wechat.citic-wealth.com/cms.product/api/custom/productInfo`

### Product Detail

```
GET /getTAProductDetail?prodCode=<id>&prodType=2
```

Returns product metadata including name, register code, and latest NAV.

| Field | Description |
|-------|-------------|
| `prodName` | Full product name |
| `prodNameShort` | Short display name |
| `registCode` | CBIRC register code (登记编码) |
| `nav` | Latest unit NAV |
| `navDate` | NAV date, format `YYYYMMDD` |

See [examples/getTAProductDetail.json](examples/getTAProductDetail.json) for a full response sample.

### NAV History

```
GET /getTAProductNav?prodCode=<id>&queryUnit=1
```

Returns historical NAV series.

Response structure:
- `data.productNavList` — list sorted newest-first, each entry has `nav`, `navDate`
- `data.productNavPic` — same data sorted oldest-first (used for chart rendering)

See [examples/getTAProductNav.json](examples/getTAProductNav.json) for a full response sample.

## Notes

- The server uses legacy TLS renegotiation (`OP_LEGACY_SERVER_CONNECT` required on Python 3.10+).
- NAV dates are date-only (`YYYYMMDD`); no intraday time is provided by the API.
