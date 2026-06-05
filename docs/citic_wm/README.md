# citic_wm — 信银理财 (CITIC Wealth Management)

Source key: `citic_wm` | Issuers: 信银理财 (CITIC Wealth) | Ticker: `prodCode`, e.g. `AF233364A`

---

## Pages

### List page

URL: `https://www.citic-wealth.com/wechat/product/#/productMarket`

Browse and search all CITIC Wealth products. Product codes appear in the detail page URL after clicking through.

### Detail page

URL: `https://www.citic-wealth.com/wechat/product/#/productMarketDetailWeb?fundCode=<prodCode>&productType=1&navDecimalPlaces=`

The `fundCode` query parameter is the `prodCode` ticker (e.g. `AF265283K`). The CBIRC register code (登记编码) appears in the 产品基本信息 section and in the 产品说明书 PDF.

---

## APIs

Base URL: `https://wechat.citic-wealth.com/cms.product/api/custom/productInfo`

### Product detail — `GET /getTAProductDetail`

```
GET /getTAProductDetail?prodCode=<prodCode>&prodType=2
```

Returns product metadata including name, register code, and latest NAV. This is the primary info + NAV-in-one call.

| Property        | Value          |
| --------------- | -------------- |
| Login required  | No             |
| Encryption      | No             |
| Signing         | No             |
| Legacy TLS      | **Yes** — `ssl.OP_LEGACY_SERVER_CONNECT` required on Python 3.10+ |
| Pagination      | N/A (single product) |

**Response fields:**

| Field           | Description                     |
| --------------- | ------------------------------- |
| `prodName`      | Full product name               |
| `prodNameShort` | Short display name              |
| `registCode`    | CBIRC register code (登记编码)  |
| `nav`           | Latest unit NAV                 |
| `navDate`       | NAV date, format `YYYYMMDD`     |

See [examples/getTAProductDetail.json](examples/getTAProductDetail.json).

### NAV history — `GET /getTAProductNav`

```
GET /getTAProductNav?prodCode=<prodCode>&queryUnit=1
```

Returns the full historical NAV series for a product.

| Property        | Value          |
| --------------- | -------------- |
| Login required  | No             |
| Encryption      | No             |
| Signing         | No             |
| Legacy TLS      | **Yes**        |
| Pagination      | No — full history returned in a single response |
| Search by code  | N/A (takes a single `prodCode`) |

**Response structure:**

- `data.productNavList` — list sorted newest-first; each entry: `nav`, `navDate` (`YYYYMMDD`)
- `data.productNavPic` — same data sorted oldest-first (for chart rendering)

See [examples/getTAProductNav.json](examples/getTAProductNav.json).

---

## Notes

- NAV dates are date-only (`YYYYMMDD`); no intraday time is provided.
- No list/search API has been found; product discovery must happen via the web UI.
