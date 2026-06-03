# Ping An Wealth (平安理财)

## Overview

Ping An Wealth (平安理财有限责任公司) is the wealth management subsidiary of Ping An Bank (平安银行).
Products are identified by a `prdCode` such as `LHCZGS2100141A`.

## API Endpoints

### Product Detail

```
GET https://rmb.pingan.com.cn/bron/ibank/pop/finachild/bootpage/finacDetail.do
    ?prdCode=<id>&sceneCode=PrdTempINI606&access_source=H5
```

Returns full product metadata and latest NAV in a single call.

| Field | Description |
|-------|-------------|
| `prdName` | Product display name |
| `bankFundRegisterCode` | CBIRC register code (登记编码) |
| `netValue` | Latest unit NAV (string) |
| `navDate` | NAV date, format `YYYYMMDD` |
| `latestRate.nav` | Same NAV as a float, inside the performance block |

See [examples/finacDetail.do.json](examples/finacDetail.do.json) for a full response sample.

## Notes

- No separate NAV history endpoint has been identified yet; only latest NAV is currently supported.
- The response wraps data under `data` with a top-level `responseCode: "000000"` on success.
- Requires a mobile `User-Agent` header; desktop UA may be blocked.
