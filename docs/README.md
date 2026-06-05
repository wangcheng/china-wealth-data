# API Documentation

Reference documentation for each data source. Each source README follows a unified layout:

- **Pages** — list page and detail page URLs for manual product discovery
- **APIs** — each endpoint with auth/encryption/signing/pagination properties and response field reference

## Sources

| Source                               | Ticker format                      | 搜索 | 详情 | 历史净值           |
| ------------------------------------ | ---------------------------------- | ---- | ---- | ------------------ |
| [abc](abc/README.md)                 | `NYJQLDGSZQ60`                     | 支持 | 支持 | 支持               |
| [citic_wm](citic_wm/README.md)       | `AF233364A`                        | —    | 支持 | 支持               |
| [pingan_bank](pingan_bank/README.md) | `LHCZGS2100141A`                   | —    | 支持 | 支持（最近 20 条） |
| [pingan_wm](pingan_wm/README.md)     | `LHCZGS141I`                       | —    | 支持 | 支持               |
| [ccb](ccb/README.md)                 | `JXLXZD180D121003A`                | —    | 支持 | 支持               |
| [ccb_wm](ccb_wm/README.md)           | numeric slug `9783965`             | —    | 支持 | —                  |
| [cmb](cmb/README.md)                 | `JXPB0201`                         | —    | 支持 | 支持               |
| [cmb_wm](cmb_wm/README.md)           | `17977D`                           | —    | 支持 | 支持               |
| [chinawealth](chinawealth/README.md) | `<register_code>_<sub_share_code>` | —    | 支持 | 支持（最近 10 条） |
| [icbc](icbc/README.md)               | `26G5619A`                         | —    | 支持 | 支持               |
| [hsbc](hsbc/README.md)               | `182481005A`                       | —    | 支持 | 支持（最近 3 年）  |

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

| Source      | Pagination                                      | Search by keyword      | Search by code            |
| ----------- | ----------------------------------------------- | ---------------------- | ------------------------- |
| abc         | Yes — `pageIndex` / `pageSize`                  | Yes — `keyword` param  | Yes — `keyword` param     |
| citic_wm    | No list API                                     | —                      | —                         |
| pingan_bank | No list API                                     | —                      | —                         |
| pingan_wm   | No list API                                     | —                      | —                         |
| ccb         | Yes — `REC_IN_PAGE` / `PAGE_JUMP`               | —                      | Yes — `IvsmPd_ECD` param  |
| ccb_wm      | No (HTML only)                                  | —                      | —                         |
| cmb         | Yes — `pageNO` / `pageSize`                     | Yes — `keyWords` param | Yes — `keyWords` param    |
| cmb_wm      | No list API                                     | —                      | —                         |
| chinawealth | N/A (lookup by register code only)              | —                      | Yes — `prodRegCode` param |
| icbc        | No list API                                     | —                      | —                         |
| hsbc        | No — all products in one response (13 observed) | —                      | —                         |

### NAV history

| Source      | Pagination                                                              | Arbitrary time range                            |
| ----------- | ----------------------------------------------------------------------- | ----------------------------------------------- |
| abc         | Yes — `i` / `s` params; `total` field confirmed (1152 records observed) | No — newest-first only, paginate back           |
| citic_wm    | No — `total: 21` observed, no pagination params (cap unverified)        | —                                               |
| pingan_bank | Yes — `pageNum` / `pageSize` (max 20)                                   | Partial — paginate back via `endDate`           |
| pingan_wm   | Yes — `pageNum` / `pageSize`                                            | Yes — `startDate` / `endDate`                   |
| ccb         | No — static `.txt` file, ~118 entries observed (cap unverified)         | —                                               |
| ccb_wm      | No — latest value only                                                  | —                                               |
| cmb         | Yes — `pageIndex` / `pageSize`                                          | Yes — `startDate` / `endDate`                   |
| cmb_wm      | No                                                                      | Partial — fixed windows: 1 / 3 / 6 / 12 months  |
| chinawealth | Yes — `pageNum` / `pageSize`                                            | —                                               |
| icbc        | Yes — `pageIndex` / `pageSize`                                          | —                                               |
| hsbc        | No                                                                      | Partial — fixed windows: 1M / 3M / 6M / 1Y / 3Y |
