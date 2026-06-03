# Ping An Wealth (平安理财)

## Overview

Ping An Wealth (平安理财有限责任公司) is the wealth management subsidiary of Ping An Bank (平安银行).
Products are identified by a `prdCode` such as `LHCZGS2100141A`.

## API Endpoints

Base URL: `https://rmb.pingan.com.cn/bron/ibank/pop/finachild/bootpage`

### Product Detail

```
GET /finacDetail.do?prdCode=<id>&sceneCode=PrdTempINI606&access_source=H5
```

Returns full product metadata and latest NAV.

| Field                  | Description                          |
| ---------------------- | ------------------------------------ |
| `prdName`              | Product display name                 |
| `bankFundRegisterCode` | CBIRC register code (登记编码)       |
| `navDate`              | NAV date, format `YYYYMMDD`          |
| `latestRate.nav`       | Latest unit NAV (float)              |
| `latestRate.totNav`    | Latest accumulated NAV (float)       |

See [examples/finacDetail.do.json](examples/finacDetail.do.json) for a full response sample.

### NAV History

```
GET /finaChildQuotationList.do
    ?prdCode=<id>&pageNum=1&pageSize=20&endDate=<YYYYMMDD>&access_source=H5
```

Returns paginated NAV history, newest-first. Server caps `pageSize` at 20 per page.
Use `endDate` to paginate backwards (set to the oldest date from the previous page).

| Field               | Description                                        |
| ------------------- | -------------------------------------------------- |
| `data.list[].nav`   | Unit NAV (string)                                  |
| `data.list[].totNav`| Accumulated NAV (string)                           |
| `data.list[].yeildDate` | NAV date, format `YYYYMMDD` (typo in API name) |
| `data.totalNum`     | Total number of entries across all pages           |

See [examples/finaChildQuotationList.do.json](examples/finaChildQuotationList.do.json) for a full response sample.

## Notes

- The response wraps data under `data` with a top-level `responseCode: "000000"` on success.
- Requires a desktop `User-Agent` and `Referer: https://b.pingan.com.cn/` header.
- `get_nav_series` fetches the latest 20 entries in one request (no pagination).
  For full history, paginate via `endDate` (set to the oldest date from each page).
