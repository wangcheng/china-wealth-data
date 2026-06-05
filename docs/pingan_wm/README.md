# pingan_wm — 平安理财 (Ping An Wealth Management)

Source key: `pingan_wm` | Issuers: 平安理财 | Ticker: `productCode` (share code), e.g. `LHCZGS141I`

---

## Pages

### List page

URL: `https://wm.pingan.com/#/product`

Lists all products on 平安理财's own platform. Click through to find the `productCode`.

### Detail page

URL: `https://wm.pingan.com/#/product/productDetail?productCode=<productCode>&raiseType=0`

The `productCode` in the URL is the ticker. The CBIRC register code (登记编码) is returned by the info API as `registerCode`.

---

## APIs

Base URL: `https://wmm.pingan.com.cn/app`

### Product info — `GET /product/getProductInfo`

```
GET /product/getProductInfo?productCode=<productCode>
Origin: https://wm.pingan.com
Referer: https://wm.pingan.com/
```

Returns product metadata. Does **not** include NAV.

| Property        | Value          |
| --------------- | -------------- |
| Login required  | No             |
| Encryption      | No             |
| Signing         | No             |
| Legacy TLS      | No             |
| Pagination      | N/A (single product) |

**Response fields:**

| Field                | Description                                       |
| -------------------- | ------------------------------------------------- |
| `productName`        | Full product name                                 |
| `productSname`       | Short name                                        |
| `productCode`        | Share code (ticker)                               |
| `registerCode`       | CBIRC register code                               |
| `institutionCodeTxt` | Issuer name (e.g. 平安理财有限责任公司)           |

See [examples/getProductInfo.json](examples/getProductInfo.json).

### NAV history — `POST /nvl/getNvlView`

```
POST /nvl/getNvlView
Content-Type: application/json
Body: <SM4-ECB encrypted hex string>
```

Returns the full historical NAV series for a product share.

| Property        | Value          |
| --------------- | -------------- |
| Login required  | No             |
| Encryption      | **Yes** — SM4 ECB, PKCS#7 padding; static key `B34440569682494CCADDAA9D603961D2`; output as lowercase hex |
| Signing         | No             |
| Legacy TLS      | No             |
| Pagination      | Supported via `pageNum`/`pageSize` in the plaintext body; set both to `0` to return all records |
| Search by code  | N/A (takes a single `productId`) |

**Encryption key source:** extracted from web bundle module 221 (`_.c` / `t.c`). Algorithm: SM4 (GB/T 32907-2016), ECB mode, PKCS#7 padding.

**Plaintext request body:**

```json
{
  "productId": "<productCode>",
  "currentTimeMillis": "<unix millis as string>",
  "pageNum": 0,
  "pageSize": 0,
  "startDate": "2025-01-01",
  "endDate": "2026-06-04",
  "uuid": "<random UUID>"
}
```

- `pageNum=0, pageSize=0` returns all records in the date range.
- `startDate`/`endDate` can be `null` to get all history.
- `currentTimeMillis` must be current (server validates it).
- `uuid` must be present (server rejects requests without it).

**Response fields (`data[]`):**

| Field             | Description                               |
| ----------------- | ----------------------------------------- |
| `dataDate`        | Date (`YYYY-MM-DD`)                       |
| `unitValue`       | Unit NAV (单位净值)                       |
| `cumulativeValue` | Accumulated NAV (累计净值)                |

See [examples/getNvlView.json](examples/getNvlView.json).

---

## Notes

- Different from `pingan_bank` which uses the older Ping An Bank API (`rmb.pingan.com.cn`) and covers third-party products sold through the bank channel.
- No list/search API has been confirmed for `getProductInfo`; product discovery must happen via the web UI.
