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

## API capability summary

### Product search / list pagination

| Source      | Pagination                                   | Search by keyword          | Search by code                            |
| ----------- | -------------------------------------------- | -------------------------- | ----------------------------------------- |
| citic_wm    | No list API                                  | —                          | —                                         |
| pingan_bank | No list API                                  | —                          | —                                         |
| pingan_wm   | No list API                                  | —                          | —                                         |
| ccb         | Yes — `REC_IN_PAGE` / `PAGE_JUMP`            | —                          | Yes — `IvsmPd_ECD` param                  |
| ccb_wm      | No (HTML only)                               | —                          | —                                         |
| cmb         | Yes — `pageNO` / `pageSize`                  | Yes — `keyWords` param     | Yes — `keyWords` param                    |
| cmb_wm      | No list API                                  | —                          | —                                         |
| chinawealth | N/A (lookup by register code only)           | —                          | Yes — `prodRegCode` param                 |
| icbc        | No list API                                  | —                          | —                                         |
| hsbc        | No — all products in one response (13 observed) | —                       | —                                         |

### NAV history

| Source      | Pagination                              | Arbitrary time range                           |
| ----------- | --------------------------------------- | ---------------------------------------------- |
| citic_wm    | No — `total: 21` observed, no pagination params (cap unverified) | — |
| pingan_bank | Yes — `pageNum` / `pageSize` (max 20)   | Partial — paginate back via `endDate`           |
| pingan_wm   | Yes — `pageNum` / `pageSize`            | Yes — `startDate` / `endDate`                   |
| ccb         | No — static `.txt` file, ~118 entries observed (cap unverified) | — |
| ccb_wm      | No — latest value only                  | —                                               |
| cmb         | Yes — `pageIndex` / `pageSize`          | Yes — `startDate` / `endDate`                   |
| cmb_wm      | No                                      | Partial — fixed windows: 1 / 3 / 6 / 12 months  |
| chinawealth | Yes — `pageNum` / `pageSize`            | —                                               |
| icbc        | Yes — `pageIndex` / `pageSize`          | —                                               |
| hsbc        | No                                      | Partial — fixed windows: 1M / 3M / 6M / 1Y / 3Y |
