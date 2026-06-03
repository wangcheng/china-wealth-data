# China Wealth Register (中国理财网)

## Overview

China Wealth Register (xinxipilu.chinawealth.com.cn) is the official disclosure platform for
bank wealth management products regulated by CBIRC. Products are identified by their CBIRC
register code (登记编码) such as `Z7007024000248`.

## Authentication

All POST requests must be signed. The signing flow is:

1. Call `getInitData` with an empty body to obtain a session-specific RSA-2048 private key (PKCS#8 PEM).
2. For every subsequent POST, compute:
   ```
   signature = base64(SHA256withRSA / PKCS1v15 ( JSON.stringify(body) ))
   ```
   and send it as the `signature` request header.

The server issues a fresh key per session. The key is delivered as a single-line PEM string
(spaces instead of newlines in the base64 body).

## API Endpoints

Base URL: `https://xinxipilu.chinawealth.com.cn/lcxp-platService`

### Get Session Key

```
POST /product/getInitData
Body: {}
```

Returns the RSA private key PEM string in `data`. No `signature` header needed for this call.

See [examples/getInitData.json](examples/getInitData.json) for a full response sample.

### Product Detail + NAV History

```
POST /product/getProductDetail
Body: {"prodRegCode": "<register_code>", "pageNum": 1, "pageSize": <n>}
```

Returns product metadata and paginated NAV history. Use `pageSize: 1` for the latest NAV only.

Key response fields under `data`:

| Path | Description |
|------|-------------|
| `prodBasicInfoVo.prodName` | Full product name |
| `prodBasicInfoVo.prodRegCode` | CBIRC register code |
| `prodBasicInfoVo.subShareCodeStr` | Comma-separated sub-share codes (some products have multiple) |
| `productTypeNetValueVo.defaultSubShareCode` | Sub-share code to use for NAV |
| `productTypeNetValueVo.netValueVoList.list` | NAV entries, newest-first |
| `netValueVoList.list[].subShareCode` | Sub-share this entry belongs to |
| `netValueVoList.list[].netValueDate` | NAV date, format `YYYY-MM-DD` |
| `netValueVoList.list[].shareNetVal` | Unit NAV (份额净值) |
| `netValueVoList.list[].acumltNetVal` | Cumulative NAV (份额累计净值) |

The latest NAV is `shareNetVal` from the first entry in `netValueVoList.list` whose
`subShareCode` matches `defaultSubShareCode`.

See [examples/getProductDetail.json](examples/getProductDetail.json) for a full response sample.

## Notes

- The session key is per-session and should be reused across requests in the same session.
- `JSON.stringify` produces compact JSON (no spaces); Python equivalent is `json.dumps(body, separators=(',', ':'))`.
- NAV dates are `YYYY-MM-DD` (ISO format), unlike some other issuers that use `YYYYMMDD`.
