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

| Path                                        | Description                                                   |
| ------------------------------------------- | ------------------------------------------------------------- |
| `prodBasicInfoVo.prodName`                  | Full product name                                             |
| `prodBasicInfoVo.prodRegCode`               | CBIRC register code                                           |
| `prodBasicInfoVo.subShareCodeStr`           | Comma-separated sub-share codes (some products have multiple) |
| `productTypeNetValueVo.defaultSubShareCode` | Sub-share code to use for NAV                                 |
| `productTypeNetValueVo.netValueVoList.list` | NAV entries, newest-first                                     |
| `netValueVoList.list[].subShareCode`        | Sub-share this entry belongs to                               |
| `netValueVoList.list[].netValueDate`        | NAV date, format `YYYY-MM-DD`                                 |
| `netValueVoList.list[].shareNetVal`         | Unit NAV (份额净值)                                           |
| `netValueVoList.list[].acumltNetVal`        | Cumulative NAV (份额累计净值)                                 |

The latest NAV is `shareNetVal` from the first entry in `netValueVoList.list` whose
`subShareCode` matches `defaultSubShareCode`.

See [examples/getProductDetail.json](examples/getProductDetail.json) for a full response sample.

## Notes

- The session key is per-session and should be reused across requests in the same session.
- `JSON.stringify` produces compact JSON (no spaces); Python equivalent is `json.dumps(body, separators=(',', ':'))`.
- NAV dates are `YYYY-MM-DD` (ISO format), unlike some other issuers that use `YYYYMMDD`.

```
curl 'https://xinxipilu.chinawealth.com.cn/lcxp-platService/product/getNetValueList' \
  -H 'Accept: application/json, text/plain, */*' \
  -H 'Accept-Language: en-GB,en-US;q=0.9,en;q=0.8,zh-CN;q=0.7,zh-HK;q=0.6,zh-TW;q=0.5,zh;q=0.4' \
  -H 'Cache-Control: no-cache' \
  -H 'Connection: keep-alive' \
  -H 'Content-Type: application/json;charset=UTF-8' \
  -b 'JSESSIONID=0295307A2FB64CFF3F71A5CE543EE54E; size=small' \
  -H 'Origin: https://xinxipilu.chinawealth.com.cn' \
  -H 'Pragma: no-cache' \
  -H 'Sec-Fetch-Dest: empty' \
  -H 'Sec-Fetch-Mode: cors' \
  -H 'Sec-Fetch-Site: same-origin' \
  -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36' \
  -H 'sec-ch-ua: "Google Chrome";v="149", "Chromium";v="149", "Not)A;Brand";v="24"' \
  -H 'sec-ch-ua-mobile: ?0' \
  -H 'sec-ch-ua-platform: "macOS"' \
  -H 'signature: UldiS7IoXBObdt7SWItO0opOFiHicdBFqigHqXS1TDiEMbmtcR3WO9OliR7+FtcBy0HVjSmLwsucPbPJEuCptNkNWS+8D+d7oYcyzqKOUpsp+ELfrc86dr1394VlIAx7hqDsjQQVxiMe4F4Y6xxD50/K8mC/UktzvvMJQKT/Lvmvm5bOqnrq1MS8iHhU1l6gt0BI8NtZWt/EbzgueYLQ7wGPcof2zTwbIdWK+T0xz/NwuPsb25BMEbYOt3NMCwjoYkU61WAvD9dDR/AKDeq2Q99MXPkwGcIFrSj0FJ5BwbExOBI4Zjm/v+MreVsuaKMV3ZWv8Dy04tMsFROTUS3BnQ==' \
  --data-raw '{"subShareCode":"182481005A","timeType":"1","prodRegCode":"Z7007024000248","pageNum":1,"pageSize":10}'
```
