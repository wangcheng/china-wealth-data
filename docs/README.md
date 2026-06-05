# API Documentation

Reference documentation for each data source. Each source README follows a unified layout:

- **Pages** — list page and detail page URLs for manual product discovery
- **APIs** — each endpoint with auth/encryption/signing/pagination properties and response field reference

## Sources

| Source | Issuer(s) | Ticker format | Auth / Notes |
| ------ | --------- | ------------- | ------------ |
| [citic_wm](citic_wm/README.md) | 信银理财 | `AF233364A` | Legacy TLS |
| [pingan_bank](pingan_bank/README.md) | 平安理财 + others via Ping An Bank | `LHCZGS2100141A` | None |
| [pingan_wm](pingan_wm/README.md) | 平安理财 | `LHCZGS141I` | SM4-ECB body encryption |
| [ccb](ccb/README.md) | 建信理财 + others via CCB | `JXLXZD180D121003A` | Legacy TLS |
| [ccb_wm](ccb_wm/README.md) | 建信理财 | numeric slug `9783965` | HTML scraping, no API |
| [cmb](cmb/README.md) | 建信理财 + others via CMB Bank | `JXPB0201` | SM4-ECB signing |
| [cmb_wm](cmb_wm/README.md) | 招银理财 | `17977D` | SM2 body encryption |
| [chinawealth](chinawealth/README.md) | Any CBIRC-registered issuer | `<register_code>_<sub_share_code>` | RSA per-session signing |
| [icbc](icbc/README.md) | 工银理财 + others via ICBC | `26G5619A` | Legacy TLS |
| [hsbc](hsbc/README.md) | 施罗德交银理财 + others via HSBC | `182481005A` | None |

## README layout

Each source README is structured as follows:

```
# <source_key> — <Chinese name> (<English name>)

Source key | Issuers | Ticker format

## Pages
  ### List page     — URL + how to find the ticker
  ### Detail page   — URL + where the register code appears

## APIs
  ### <endpoint name>
    - Request format (method, URL, body)
    - Table: Login required / Encryption / Signing / Legacy TLS / Pagination / Search by code
    - Signing: how to obtain the key and compute the value
    - Response field reference table
    - Link to example file

## Notes
  Non-obvious quirks, known limitations, TODOs
```

## Pagination capability summary

| Source | List/Search pagination | NAV history pagination |
| ------ | ---------------------- | ---------------------- |
| citic_wm | No list API | No — full history in one response |
| pingan_bank | N/A | Yes — `pageNum`/`pageSize`, backwards via `endDate` |
| pingan_wm | No list API | Yes — `pageNum`/`pageSize`, or `pageNum=0` for all |
| ccb | Yes — `REC_IN_PAGE`/`PAGE_JUMP` | No — static file, full history |
| ccb_wm | No (HTML only) | No (embedded JS, latest only) |
| cmb | Yes — `pageNO`/`pageSize`, keyword search | Yes — `pageIndex`/`pageSize`, date range |
| cmb_wm | No list API | Partial — `monthNum` window (1/3/6/12 months), no page pagination |
| chinawealth | N/A | Yes — `pageNum`/`pageSize` |
| icbc | No list API | Yes — `pageIndex`/`pageSize` |
| hsbc | No list API | Partial — `date` window (1M/3M/6M/1Y/3Y), no page pagination |

## Search capability summary

| Source | Can search products by keyword/code? | API |
| ------ | ------------------------------------ | --- |
| ccb | Yes | `TXCODE=NLCQ11` + `IvsmPd_ECD` param |
| cmb | Yes | `queryProdList` with `keyWords` |
| chinawealth | Yes | `getProductDetail` with `prodRegCode` |
| others | No API found | Manual discovery via web UI only |
