# hsbc — 汇丰银行 (HSBC China)

Source key: `hsbc` | Issuers: 施罗德交银理财 + others sold by HSBC China | Ticker: sub-share code (CBIRC sub-share / fund code), e.g. `182481005A`

---

## Pages

### List page

URL: `https://www.hsbc.com.cn/investment-platform/pws/wmp/#/`

Lists wealth management products sold through HSBC China. Product codes (sub-share codes) appear on the list and detail pages.

### Detail page

URL: `https://www.hsbc.com.cn/investment-platform/pws/wmp/#/<ticker>`

Displays product metadata, latest NAV, and historical performance. The `cdcCde` field in the detail API returns the CBIRC register code (登记编码).

---

## APIs

Base URL: `https://www.hsbc.com.cn/api/wealth-cn-srbp-shp-api-cn-anonymous-prod-proxy/v0/ut`

All requests require the header `x-hsbc-chnl-countrycode: CN`.

### Product list — `GET /v2/productList/WMP`

```
GET /v2/productList/WMP?flowIndicator=PWS
x-hsbc-chnl-countrycode: CN
```

Returns all products currently sold through HSBC China in a single response (13 products observed, no pagination).

| Property        | Value          |
| --------------- | -------------- |
| Login required  | No             |
| Encryption      | No             |
| Signing         | No             |
| Legacy TLS      | No             |
| Pagination      | No — all products returned in one response (`pagination.totalNumberOfRecords` observed as 13) |
| Search by code  | No — returns full list only |
| Required headers | `x-hsbc-chnl-countrycode: CN`, `x-hsbc-channel-for-hundsun: PIB`, `x-hsbc-channel-id: OHI`, `x-hsbc-chnl-group-member: HSBC` |

**Response structure:**

- `productList[]` — active products with full metadata and latest NAV
- `fullList[]` — all products (including inactive) with name and ID only
- `pagination` — `pageNum`, `pageSize`, `totalNumberOfRecords`

**Key fields per `productList[]` entry:**

| Field         | Description                                                        |
| ------------- | ------------------------------------------------------------------ |
| `productId[]` | Array of ID objects; ticker = `productAlternativeNumber` where `productAlternativeClassificationCode == "M"` |
| `prodPllName` | Product name                                                       |
| `nav`         | Unit NAV                                                           |
| `tolNav`      | Accumulated NAV                                                    |
| `issDate`     | NAV date (`YYYY-MM-DD`)                                            |
| `fundCompany` | Issuer name                                                        |
| `riskLvlCde`  | Risk level code                                                    |

See [examples/productList.json](examples/productList.json).

### Product detail — `GET /v2/productDetail/WMP/CN/<ticker>`

```
GET /v2/productDetail/WMP/CN/<ticker>
x-hsbc-chnl-countrycode: CN
```

Returns product metadata and latest NAV in a single response.

| Property        | Value          |
| --------------- | -------------- |
| Login required  | No             |
| Encryption      | No             |
| Signing         | No             |
| Legacy TLS      | No             |
| Pagination      | N/A (single product) |
| Required headers | `x-hsbc-chnl-countrycode: CN` |

**Response fields:**

| Field         | Description                                         |
| ------------- | --------------------------------------------------- |
| `prodPllName` | Product name                                        |
| `cdcCde`      | CBIRC register code (登记编码), e.g. `Z7007024000248` |
| `nav`         | Unit NAV (单位净值)                                 |
| `tolNav`      | Accumulated/total NAV (累计净值)                    |
| `issDate`     | NAV date, format `YYYY-MM-DD HH:MM:SS` (truncate to date) |

See [examples/productDetail.json](examples/productDetail.json).

### NAV history — `GET /performanceHist/WMP/CN/<ticker>`

```
GET /performanceHist/WMP/CN/<ticker>?date=3Y
x-hsbc-chnl-countrycode: CN
```

Returns up to 3 years of daily NAV history.

| Property        | Value          |
| --------------- | -------------- |
| Login required  | No             |
| Encryption      | No             |
| Signing         | No             |
| Legacy TLS      | No             |
| Pagination      | **Partial** — `date` parameter selects time window: `1M`, `3M`, `6M`, `1Y`, `3Y`. No page-based pagination; full window returned in one response. |
| Search by code  | N/A (takes a single ticker) |

**Response fields (`performanceList[]`):**

| Field                  | Description                    |
| ---------------------- | ------------------------------ |
| `unitNetWorth`         | Unit NAV for this entry        |
| `cumulativeNetWorth`   | Accumulated NAV for this entry |
| `date`                 | Date, format `YYYY-MM-DD`      |

See [examples/performanceHist.json](examples/performanceHist.json).

---

## Notes

- The ticker is the sub-share code (份额代码), not the product register code. One product may have multiple sub-shares.
- The ticker is `productAlternativeNumber` where `productAlternativeClassificationCode == "M"` in the list API response.
- The list API also returns a `W`-coded alternative number (a numeric internal ID); this is not the ticker.
