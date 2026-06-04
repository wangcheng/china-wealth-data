# CCB (建设银行) source

Source key: `ccb`  
Class: `CcbSource` (`sources/ccb.py`)

Products sold through CCB Bank's online channel (`www2.ccb.com`). Ticker is the product code `IvsmPd_ECD`, e.g. `JXLXZD180D121003A`.

Requires legacy TLS (`legacy_tls_session()` from `china_wealth.http`).

## Endpoints

All requests go to:

```
GET https://www2.ccb.com/tran/WCCMainPlatV5
```

Static NAV history files are served from:

```
GET https://www2.ccb.com/newsinfo/finance/<filename>.txt
```

## Product list / single product — TXCODE=NLCQ11

### Request parameters

| Parameter               | Value         | Notes                             |
| ----------------------- | ------------- | --------------------------------- |
| `CCB_IBSVersion`        | `V5`          |                                   |
| `SERVLET_NAME`          | `WCCMainPlatV5` |                                 |
| `TXCODE`                | `NLCQ11`      | list and single-product lookup    |
| `Fcn_Cd`                | `0`           |                                   |
| `REC_IN_PAGE`           | `1`           | 1 for single product lookup       |
| `PAGE_JUMP`             | `1`           |                                   |
| `Sel_StCd`              | `9`           | all statuses                      |
| `Txn_BO_ID`             | `110000000`   | Beijing branch                    |
| `Chnl_ID`               | `10060009`    |                                   |
| `FndCo_Agnc_Sale_InsID` | `005`         | CCB channel constant              |
| `Crt_Chnl_ID`           | `9999999999`  |                                   |
| `PD_Sl_Obj_Cd`          | `01`          | retail                            |
| `Bkstg_PD_Tp_ECD`       | `01`          |                                   |
| `IvsmPd_ECD`            | `<ticker>`    | add to filter to a single product |

### Response fields (`PROD_INFO_GRP[0]`)

| Field              | Description                                       |
| ------------------ | ------------------------------------------------- |
| `IvsmPd_ECD`       | Product code (= ticker)                           |
| `Fnd_Nm`           | Product name                                      |
| `Co_Nm`            | Issuer name (e.g. 建信理财有限责任公司)             |
| `Unit_Ast_NetVal`  | Unit NAV (string, e.g. `"1.014119"`)              |
| `NetVal_Dt`        | NAV date (`YYYYMMDD`)                             |
| `Txn_Mkt_ID`       | Market ID (e.g. `"0JH"`) — needed for NAV history |
| `CcyCd`            | Currency code (`156`=CNY, `840`=USD)              |
| `Rsk_Grd_Cd`       | Risk grade (`01`–`05`)                            |
| `PfCmpBss`         | Performance benchmark                             |

See [`examples/getProducts.json`](examples/getProducts.json) for a full example.

## NAV history — TXCODE=NLCZST + static file

NAV history is served as a pre-generated static `.txt` file. Fetching it is a two-step process.

### Step 1: availability check

```
GET https://www2.ccb.com/tran/WCCMainPlatV5
  TXCODE=NLCZST
  IvsmPd_ECD=<ticker>
  Txn_Mkt_ID=<Txn_Mkt_ID from product>
  FndCo_Agnc_Sale_InsID=005
  PD_Grp_ECD=40
  Ctrl_Ind_Cgy=09
```

Response: `{"result":"y"}` if available, otherwise `{"result":"n"}` or empty.

`Ctrl_Ind_Cgy=09` selects chart type `单位净值` (unit NAV). Other values are yield/return-rate charts and are not used.

### Step 2: fetch the file

```
GET https://www2.ccb.com/newsinfo/finance/<IvsmPd_ECD><Txn_Mkt_ID><FndCo_Agnc_Sale_InsID>4009.txt
```

Example for `JXLXZD180D121003A` with `Txn_Mkt_ID=0JH`:

```
https://www2.ccb.com/newsinfo/finance/JXLXZD180D121003A0JH0054009.txt
```

### Response fields (`Index_Group[]`)

| Field        | Description                    |
| ------------ | ------------------------------ |
| `Qtn_Dt`     | Date (`YYYYMMDD`)              |
| `Exp_YldRto` | Unit NAV (raw string, no transformation needed) |

See [`examples/nav_history.json`](examples/nav_history.json) for a full example (118 entries).

## Quirks

- **No register code**: CBIRC register code is not included in the API response. `register_code` is always `None`.
- **No auth required**: works without cookies or session tokens.
- **Accumulated NAV**: not provided by any endpoint; `accumulated_nav` is always `None`.
- **`FndCo_Agnc_Sale_InsID`** is a fixed CCB channel constant (`005`) — it is a request parameter only, not returned in product data.
- **Legacy TLS**: `www2.ccb.com` requires `ssl.OP_LEGACY_SERVER_CONNECT` (Python 3.10+).
- **`Ctrl_Ind_Cgy` values**: `09`=单位净值 (unit NAV, raw value), `07`=成立以来年化收益率 (annualized return %, ×100), `01`=七日年化. Only `09` gives actual NAV.
