# ICBC (工商银行) Source

Source key: `icbc`  
Issuers served: 工银理财 + others sold by ICBC

## Overview

Covers net-value wealth products (净值型理财产品) distributed by ICBC. Products are identified by `prodId`, e.g. `26G5619A`.

## Endpoints

All endpoints accept `POST` with `Content-Type: application/json`.

### Product detail

```
POST https://papi.icbc.com.cn/finance/financeWap/detail
Origin: https://m.icbc.com.cn
Body: {"productId": "<prodId>"}
```

Returns product metadata. Note: uses `productId` (not `prodId`) in the request body.

### NAV history

```
POST https://papi.icbc.com.cn/finance/deposit/consignment/getNetValueList
Origin: https://www.icbc.com.cn
Body: {"prodId": "<prodId>", "pageIndex": 1, "pageSize": 10}
```

Returns paginated NAV entries sorted newest-first. The `pages` and `total` fields in `data` indicate total page count and record count.

## Response field reference

### Detail response (`data` object)

| Field         | Description       |
| ------------- | ----------------- |
| `productId`   | Product identifier |
| `productName` | Full product name  |

No CBIRC register code is exposed; `register_code` is always `None`.

### NAV history response (`data.list[]`)

| Field      | Description                           |
| ---------- | ------------------------------------- |
| `workDate` | NAV date, ISO format `YYYY-MM-DD`     |
| `value`    | Unit NAV (e.g. `"1.000000"`)          |
| `totValue` | Accumulated NAV (e.g. `"1.000000"`)   |
| `prodName` | Product name (repeated on each entry) |

## Quirks

- The detail endpoint uses `productId` in the request body; the NAV endpoint uses `prodId` — same value, different key name.
- The two endpoints require different `Origin` headers (`m.icbc.com.cn` vs `www.icbc.com.cn`).
- No CBIRC register code is available from any endpoint.
