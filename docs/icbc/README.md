# icbc — 工商银行 (Industrial and Commercial Bank of China)

Source key: `icbc` | Issuers: 工银理财 + others sold by ICBC | Ticker: `prodId`, e.g. `26G5619A`

---

## Pages

### List page

URL: `https://m.icbc.com.cn/` (navigate to 理财产品 section)

Lists net-value wealth products (净值型理财产品) distributed by ICBC. Product IDs appear in the detail pages.

### Detail page

URL: `https://m.icbc.com.cn/` (navigate to individual product)

Displays product metadata. The CBIRC register code (登记编码) is **not exposed** on any ICBC page or API response.

---

## APIs

All endpoints: `POST` with `Content-Type: application/json`.

### Product detail — `POST /finance/financeWap/detail`

```
POST https://papi.icbc.com.cn/finance/financeWap/detail
Origin: https://m.icbc.com.cn
Body: {"productId": "<prodId>"}
```

Note: the request body field is `productId` (not `prodId`).

| Property        | Value          |
| --------------- | -------------- |
| Login required  | No             |
| Encryption      | No             |
| Signing         | No             |
| Legacy TLS      | **Yes** — `ssl.OP_LEGACY_SERVER_CONNECT` required |
| Pagination      | N/A (single product) |
| Required headers | `Origin: https://m.icbc.com.cn` |

**Response fields (`data`):**

| Field         | Description       |
| ------------- | ----------------- |
| `productId`   | Product identifier |
| `productName` | Full product name  |

Register code is **not available** from this endpoint.

See [examples/detail.json](examples/detail.json).

### NAV history — `POST /finance/deposit/consignment/getNetValueList`

```
POST https://papi.icbc.com.cn/finance/deposit/consignment/getNetValueList
Origin: https://www.icbc.com.cn
Body: {"prodId": "<prodId>", "pageIndex": 1, "pageSize": 10}
```

Note: the request body field is `prodId` (not `productId` — different from the detail endpoint).

| Property        | Value          |
| --------------- | -------------- |
| Login required  | No             |
| Encryption      | No             |
| Signing         | No             |
| Legacy TLS      | **Yes**        |
| Pagination      | **Yes** — `pageIndex` / `pageSize`. `data.pages` = total page count, `data.total` = total record count. |
| Search by code  | N/A (takes a single `prodId`) |
| Required headers | `Origin: https://www.icbc.com.cn` (different from detail endpoint) |

**Response fields (`data.list[]`):**

| Field      | Description                           |
| ---------- | ------------------------------------- |
| `workDate` | NAV date, ISO format `YYYY-MM-DD`     |
| `value`    | Unit NAV (e.g. `"1.000000"`)          |
| `totValue` | Accumulated NAV (e.g. `"1.000000"`)   |
| `prodName` | Product name (repeated on each entry) |

See [examples/getNetValueList.json](examples/getNetValueList.json).

---

## Notes

- The two endpoints use **different field names** for the same value: `productId` (detail) vs `prodId` (NAV list).
- The two endpoints also require **different `Origin` headers**: `m.icbc.com.cn` (detail) vs `www.icbc.com.cn` (NAV).
- CBIRC register code is **never** available from any ICBC endpoint — `register_code` is always `None`.
