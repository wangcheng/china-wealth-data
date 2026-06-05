# cmb — 招商银行 (China Merchants Bank)

Source key: `cmb` | Issuers: 建信理财 + others sold by CMB Bank | Ticker: `prdCode`, e.g. `JXPB0201`

---

## Pages

### List page

URL: `https://finprod.paas.cmbchina.com/`

Search or browse products sold through CMB Bank. The `prdCode` (= `code` field in search results) is the ticker.

### Detail / value page

URL: `https://cfweb.paas.cmbchina.com/personal/prodvalue.aspx`

Enter a `prdCode` to view NAV history. The CBIRC register code (登记编码) is returned by the product info API as `regCode`.

---

## APIs

Two separate base URLs:

- Product search: `https://finprod.paas.cmbchina.com`
- Product info + NAV: `https://cfweb.paas.cmbchina.com`

All requests require `appid`, `timespan`, and `signature` headers (see Signing below).

### Product search — `POST /api/prod/queryProdList`

```
POST https://finprod.paas.cmbchina.com/api/prod/queryProdList
Content-Type: application/json;charset=UTF-8
appid: FinProd
Body: {"keyWords":"","type":"PN","isOwn":"A","isPublic":"Z","status":"0","pageNO":1,"pageSize":50,...}
```

| Property        | Value          |
| --------------- | -------------- |
| Login required  | No             |
| Encryption      | No             |
| Signing         | **Yes** — same SM4-ECB scheme as cfweb (see Signing below), with `appid: FinProd` |
| Legacy TLS      | No             |
| Pagination      | **Yes** — `pageNO` / `pageSize` |
| Search by code  | **Yes** — set `keyWords` to a product name fragment or code; empty string lists all |

Result `code` field is the `prdCode` ticker.

See [examples/queryProdList.json](examples/queryProdList.json).

### Product info — `POST /api/ProductInfo/getproductbyprdcode`

```
POST https://cfweb.paas.cmbchina.com/api/ProductInfo/getproductbyprdcode?prdCode=<prdCode>
(no request body)
```

| Property        | Value          |
| --------------- | -------------- |
| Login required  | No             |
| Encryption      | No             |
| Signing         | **Yes** — SM4-ECB (see Signing below) |
| Legacy TLS      | No             |
| Pagination      | N/A (single product) |

**Response fields (`body[0]`):**

| Field      | Description                                                         |
| ---------- | ------------------------------------------------------------------- |
| `prdCode`  | Product code (= ticker)                                             |
| `prdName`  | Full product name                                                   |
| `regCode`  | CBIRC register code                                                 |
| `saaCod`   | Category code — required for NAV history queries                    |
| `funCod`   | Fund code (= `prdCode`)                                             |
| `comNam`   | Issuer company name                                                 |
| `netValue` | Latest NAV (often empty — use NAV history endpoint instead)         |

See [examples/getproductbyprdcode.json](examples/getproductbyprdcode.json).

### Product detail (alternative) — `POST /api/ProductInfo/getSAProductDetailInfo`

```
POST https://cfweb.paas.cmbchina.com/api/ProductInfo/getSAProductDetailInfo?saaCod=<saaCod>&funCod=<prdCode>
(no request body)
```

Alternative info endpoint. Requires `saaCod` which must be fetched from `getproductbyprdcode` first.

See [examples/getSAProductDetailInfo,json](examples/getSAProductDetailInfo,json).

### NAV history — `POST /api/ProductValue/getSAValueByPageOrDate`

```
POST https://cfweb.paas.cmbchina.com/api/ProductValue/getSAValueByPageOrDate
Content-Type: application/json;charset=UTF-8
Body: {"saaCod":"<saaCod>","funCod":"<prdCode>","pageIndex":1,"pageSize":50,"startDate":"","endDate":""}
```

| Property        | Value          |
| --------------- | -------------- |
| Login required  | No             |
| Encryption      | No             |
| Signing         | **Yes** — SM4-ECB (see Signing below) |
| Legacy TLS      | No             |
| Pagination      | **Yes** — `pageIndex` / `pageSize` (max observed page size: 50). Date range filter: `startDate` / `endDate` (`YYYYMMDD`). |
| Search by code  | N/A (takes a single product) |

**Response fields (`body.data[]`):**

| Field     | Description              |
| --------- | ------------------------ |
| `znavDat` | NAV date (`YYYYMMDD`)    |
| `znavVal` | Unit NAV (string)        |
| `znavCtl` | Accumulated NAV (string) |
| `zripSnm` | Product short name       |
| `zsaaCod` | Category code            |

`body.totalRecord` and `body.totalPage` indicate total records and pages.

See [examples/getSAValueByPageOrDate.json](examples/getSAValueByPageOrDate.json).

---

## Signing

Every request to both `finprod.paas.cmbchina.com` and `cfweb.paas.cmbchina.com` requires three headers:

| Header      | Value                                                                         |
| ----------- | ----------------------------------------------------------------------------- |
| `appid`     | `LB50.22_CFWebUI` (for cfweb) or `FinProd` (for finprod)                     |
| `timespan`  | Current Unix timestamp in milliseconds                                        |
| `signature` | SM4-ECB encrypt `"<appid>|<timespan>"`, base64-encode result                  |

**Algorithm:** SM4 (国密, GB/T 32907), ECB mode, PKCS#7 padding.

**Key:** base64-decode `NXF3QkdqdTczSkFYaWQ0RA==` → 16-byte key (`5qwBGju73JAXid4D`).

Key constant extracted from `AUTH_SN` in `umi.js` (lines ~116494–116575).

---

## Notes

- `saaCod` is a short internal category code (e.g. `D07`) returned by the info endpoint; it must be paired with `funCod` for NAV queries.
- `netValue` in `getproductbyprdcode` is often an empty string; always use the NAV history endpoint for price data.
