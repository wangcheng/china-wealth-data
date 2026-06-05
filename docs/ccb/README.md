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

All requests use:

```
GET https://www2.ccb.com/tran/WCCMainPlatV5
```

Static NAV history files:

```
GET https://www2.ccb.com/newsinfo/finance/<filename>.txt
```

### Product list / single product — `TXCODE=NLCQ11`

```
GET https://www2.ccb.com/tran/WCCMainPlatV5?CCB_IBSVersion=V5&SERVLET_NAME=WCCMainPlatV5&TXCODE=NLCQ11&...
```

Used both for listing products and for fetching a single product by `IvsmPd_ECD`.

| Property       | Value                                                                                                                 |
| -------------- | --------------------------------------------------------------------------------------------------------------------- |
| Login required | No                                                                                                                    |
| Encryption     | No                                                                                                                    |
| Signing        | No                                                                                                                    |
| Legacy TLS     | **Yes** — `ssl.OP_LEGACY_SERVER_CONNECT` required                                                                     |
| Pagination     | **Yes** — `REC_IN_PAGE` (records per page), `PAGE_JUMP` (page number). Set `REC_IN_PAGE=1` for single-product lookup. |
| Search by code | **Yes** — add `IvsmPd_ECD=<ticker>` parameter to filter to a single product                                           |

**Key request parameters:**

| Parameter               | Value      | Notes                             |
| ----------------------- | ---------- | --------------------------------- |
| `TXCODE`                | `NLCQ11`   | list and single-product lookup    |
| `REC_IN_PAGE`           | `1`        | 1 for single product lookup       |
| `PAGE_JUMP`             | `1`        | page number                       |
| `Sel_StCd`              | `9`        | all statuses                      |
| `FndCo_Agnc_Sale_InsID` | `005`      | CCB channel constant              |
| `IvsmPd_ECD`            | `<ticker>` | add to filter to a single product |

**Response fields (`PROD_INFO_GRP[0]`):**

| Field             | Description                               |
| ----------------- | ----------------------------------------- |
| `IvsmPd_ECD`      | Product code (= ticker)                   |
| `Fnd_Nm`          | Product name                              |
| `Unit_Ast_NetVal` | Unit NAV (string)                         |
| `NetVal_Dt`       | NAV date (`YYYYMMDD`)                     |
| `Txn_Mkt_ID`      | Market ID — needed for NAV history lookup |

See [examples/getProducts.json](examples/getProducts.json).

### NAV availability check — `TXCODE=NLCZST`

Step 1 of the NAV history flow. Checks whether a pre-generated NAV history file exists for this product.

```
GET https://www2.ccb.com/tran/WCCMainPlatV5?TXCODE=NLCZST&IvsmPd_ECD=<ticker>&Txn_Mkt_ID=<id>&FndCo_Agnc_Sale_InsID=005&PD_Grp_ECD=40&Ctrl_Ind_Cgy=09
```

| Property       | Value   |
| -------------- | ------- |
| Login required | No      |
| Encryption     | No      |
| Signing        | No      |
| Legacy TLS     | **Yes** |
| Pagination     | N/A     |

Response: `{"result":"y"}` if available, `{"result":"n"}` or empty otherwise.

`Ctrl_Ind_Cgy=09` selects 单位净值 (unit NAV). Other values are yield/return-rate charts.

### NAV history static file

Step 2 of the NAV history flow. Fetches a pre-generated `.txt` file.

```
GET https://www2.ccb.com/newsinfo/finance/<IvsmPd_ECD><Txn_Mkt_ID><FndCo_Agnc_Sale_InsID>4009.txt
```

Example: `https://www2.ccb.com/newsinfo/finance/JXLXZD180D121003A0JH0054009.txt`

| Property       | Value                         |
| -------------- | ----------------------------- |
| Login required | No                            |
| Encryption     | No                            |
| Signing        | No                            |
| Legacy TLS     | **Yes**                       |
| Pagination     | No — full history in one file |

**Response fields (`Index_Group[]`):**

| Field        | Description                              |
| ------------ | ---------------------------------------- |
| `Qtn_Dt`     | Date (`YYYYMMDD`)                        |
| `Exp_YldRto` | Unit NAV (raw string, no transformation) |

See [examples/nav_history.json](examples/nav_history.json).

---

## Notes

- CBIRC register code is **never** available from any CCB API — `register_code` is always `None`.
- Accumulated NAV is not provided; `accumulated_nav` is always `None`.
- `FndCo_Agnc_Sale_InsID=005` is a fixed CCB channel constant — request parameter only, not returned in data.
- `Ctrl_Ind_Cgy` values: `09`=单位净值, `07`=成立以来年化收益率, `01`=七日年化. Only `09` gives actual NAV.
