# ccb — 建设银行 (China Construction Bank)

Source key: `ccb` | Issuers: 建信理财 + others sold by CCB | Ticker: `IvsmPd_ECD`, e.g. `JXLXZD180D121003A`

---

## Pages

### List page

URL: `https://www2.ccb.com/chn/finance/products/self/product_list.shtml`

Lists wealth products sold through CCB Bank. The product code (`IvsmPd_ECD`) is shown on the list and detail pages.

### Detail page

URL: Navigated from the list page by clicking a product.

The CBIRC register code is **not exposed** on any CCB page or API response.

---

## APIs

All `WCCMainPlatV5` requests share the base URL:

```
GET https://www2.ccb.com/tran/WCCMainPlatV5?CCB_IBSVersion=V5&SERVLET_NAME=WCCMainPlatV5&TXCODE=<code>&...
```

Common properties unless noted otherwise: Login required: No | Encryption: No | Signing: No | Legacy TLS: **Yes**

`Ctrl_Ind_Cgy` values used across endpoints: `09`=单位净值, `07`=成立以来年化收益率, `01`=七日年化.

---

### Product list / single product — `TXCODE=NLCQ11`

Used both for listing products and for fetching a single product by `IvsmPd_ECD`.

| Property       | Value                                                                                                                 |
| -------------- | --------------------------------------------------------------------------------------------------------------------- |
| Login required | No                                                                                                                    |
| Pagination     | **Yes** — `REC_IN_PAGE` (records per page), `PAGE_JUMP` (page number). Set `REC_IN_PAGE=1` for single-product lookup. |
| Search by code | **Yes** — add `IvsmPd_ECD=<ticker>` to filter to a single product                                                    |

**Key request parameters:**

| Parameter               | Value      | Notes                          |
| ----------------------- | ---------- | ------------------------------ |
| `REC_IN_PAGE`           | `1`        | 1 for single-product lookup    |
| `PAGE_JUMP`             | `1`        | page number                    |
| `Sel_StCd`              | `9`        | all statuses                   |
| `FndCo_Agnc_Sale_InsID` | `005`      | CCB channel constant           |
| `IvsmPd_ECD`            | `<ticker>` | filter to a single product     |

**Response fields (`PROD_INFO_GRP[0]`):**

| Field             | Description                               |
| ----------------- | ----------------------------------------- |
| `IvsmPd_ECD`      | Product code (= ticker)                   |
| `Fnd_Nm`          | Product name                              |
| `Unit_Ast_NetVal` | Unit NAV (string)                         |
| `NetVal_Dt`       | NAV date (`YYYYMMDD`)                     |
| `Txn_Mkt_ID`      | Market ID — needed for NAV history lookup |

See [examples/getProducts.json](examples/getProducts.json).

---

### NAV availability check — `TXCODE=NLCZST`

Step 1 of the NAV history flow. Checks whether a pre-generated NAV history file exists for this product.

```
GET ...&TXCODE=NLCZST&IvsmPd_ECD=<ticker>&Txn_Mkt_ID=<id>&FndCo_Agnc_Sale_InsID=005&PD_Grp_ECD=40&Ctrl_Ind_Cgy=09
```

| Property   | Value |
| ---------- | ----- |
| Pagination | N/A   |

Response: `{"result":"y"}` if available, `{"result":"n"}` or empty otherwise.

---

### NAV history static file

Step 2 of the NAV history flow. Fetches a pre-generated `.txt` file — no auth required.

Filename pattern: `<IvsmPd_ECD><Txn_Mkt_ID><FndCo_Agnc_Sale_InsID><PD_Grp_ECD><Ctrl_Ind_Cgy>.txt`

Example (unit NAV, `PD_Grp_ECD=40`, `Ctrl_Ind_Cgy=09`):
```
GET https://www2.ccb.com/newsinfo/finance/JXLXZD180D121003A0JH0054009.txt
```

| Property   | Value                         |
| ---------- | ----------------------------- |
| Pagination | No — full history in one file |

**Response fields (`Index_Group[]`):**

| Field        | Description                              |
| ------------ | ---------------------------------------- |
| `Qtn_Dt`     | Date (`YYYYMMDD`)                        |
| `Exp_YldRto` | Unit NAV (raw string, no transformation) |

See [examples/nav_history.json](examples/nav_history.json).

---

### Past performance table — `TXCODE=NLC162` *(login required)*

Returns `Index_Group[]` with period-based annualized return data (not unit NAV).

```
GET ...&TXCODE=NLC162&IvsmPd_ECD=<ticker>&Txn_Mkt_ID=<id>&FndCo_Agnc_Sale_InsID=005&PD_Grp_ECD=40
```

| Property       | Value                                      |
| -------------- | ------------------------------------------ |
| Login required | **Yes** — returns 交易失败 without session |
| Pagination     | No                                         |

**Response fields (`Index_Group[]`):**

| Field        | Description                                |
| ------------ | ------------------------------------------ |
| `Rmrk_1_Inf` | Period start date (`YYYYMMDD`)             |
| `Rmrk_2_Inf` | Period end date (`YYYYMMDD`)               |
| `Exp_YldRto` | Annualized return for the period (decimal) |

---

### Range chart data — `TXCODE=NLC163` *(login required)*

Returns `Index_Group[]` keyed by period ID for the performance summary table (近1月, 近3月, etc.).

```
GET ...&TXCODE=NLC163&IvsmPd_ECD=<ticker>&Txn_Mkt_ID=<id>&FndCo_Agnc_Sale_InsID=005&PD_Grp_ECD=40&Ctrl_Ind_Cgy=<type>&SrtDt=<YYYYMMDD>&TmDt=<YYYYMMDD>
```

| Property       | Value                                      |
| -------------- | ------------------------------------------ |
| Login required | **Yes** — returns 交易失败 without session |
| Pagination     | No                                         |

**Extra request parameters:**

| Parameter      | Notes                                        |
| -------------- | -------------------------------------------- |
| `Ctrl_Ind_Cgy` | See common values above                      |
| `SrtDt`        | Start date (`YYYYMMDD`); JS sets to 2 days ago |
| `TmDt`         | End date (`YYYYMMDD`); JS sets to same as `SrtDt` |

**Period IDs (returned in `Rmrk_1_Inf`):**

| ID   | Period     |
| ---- | ---------- |
| `19` | 近1月      |
| `20` | 近3月      |
| `21` | 近6月      |
| `22` | 近1年      |
| `24` | 成立以来   |

---

### Past returns table — `TXCODE=NLCQ58` *(login required)*

Paginated table of historical return records. Two modes via `Fcn_Cd`.

```
GET ...&TXCODE=NLCQ58&IvsmPd_ECD=<ticker>&Fcn_Cd=<1|2>&REC_IN_PAGE=<n>&PAGE_JUMP=<page>
```

| Property       | Value                                      |
| -------------- | ------------------------------------------ |
| Login required | **Yes** — returns 交易失败 without session |
| Pagination     | **Yes** — `REC_IN_PAGE`, `PAGE_JUMP`       |

**`Fcn_Cd` modes:**

| Value | Description                                                                      |
| ----- | -------------------------------------------------------------------------------- |
| `1`   | Summary list — returns `RECOMMEND_RATE_LIST[]`, up to 50 records per page        |
| `2`   | Detailed table — adds `IvsChmtPd_YldRto_TpCd` type selector, 5 records per page |

**Response fields (`RECOMMEND_RATE_LIST[]`):**

| Field         | Description       |
| ------------- | ----------------- |
| `Dsc_1`       | Period label      |
| `Dt_Cmnt`     | Date range string |
| `YldRto_Cmnt` | Return rate string |

---

## Notes

- CBIRC register code is **never** available from any CCB API — `register_code` is always `None`.
- Accumulated NAV is not provided; `accumulated_nav` is always `None`.
- `FndCo_Agnc_Sale_InsID=005` is a fixed CCB channel constant — request parameter only, not returned in data.
- `NLC162`, `NLC163`, `NLCQ58` all require login and return annualized yield/return data, not unit NAV — no implementation value for unauthenticated use.
