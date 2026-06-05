# pingan_bank — 平安银行 (Ping An Bank)

Source key: `pingan_bank` | Issuers: 平安理财 + others sold by Ping An Bank | Ticker: `prdCode`, e.g. `LHCZGS2100141A`

---

## Pages

### List page

URL: `https://b.pingan.com.cn/aum/m/inventory_search.html?dataType=07&sellingType=FINANCESUB`

Lists all wealth products sold through Ping An Bank, including products from 平安理财 and other issuers. The `prdCode` for each product appears in the detail page URL.

### Detail page

URL: `https://b.pingan.com.cn/fin/mobile/finance_current_detail.html?prdCode=<prdCode>&templateId=PrdTempINI602&useCdn=1`

The `prdCode` in the URL is the ticker. The CBIRC register code (登记编码) is shown in the product's 产品基本信息 section and returned by the detail API as `bankFundRegisterCode`.

---

## APIs

Base URL: `https://rmb.pingan.com.cn/bron/ibank/pop/finachild/bootpage`

### Product detail — `GET /finacDetail.do`

```
GET /finacDetail.do?prdCode=<prdCode>&sceneCode=PrdTempINI606&access_source=H5
```

Returns full product metadata and latest NAV in a single call.

| Property        | Value          |
| --------------- | -------------- |
| Login required  | No             |
| Encryption      | No             |
| Signing         | No             |
| Legacy TLS      | No             |
| Pagination      | N/A (single product) |
| Required headers | `User-Agent` (desktop), `Referer: https://b.pingan.com.cn/` |

**Response fields:**

| Field                    | Description                          |
| ------------------------ | ------------------------------------ |
| `prdName`                | Product display name                 |
| `bankFundRegisterCode`   | CBIRC register code (登记编码)       |
| `navDate`                | NAV date, format `YYYYMMDD`          |
| `latestRate.nav`         | Latest unit NAV (float)              |
| `latestRate.totNav`      | Latest accumulated NAV (float)       |

See [examples/finacDetail.do.json](examples/finacDetail.do.json).

### NAV history — `GET /finaChildQuotationList.do`

```
GET /finaChildQuotationList.do?prdCode=<prdCode>&pageNum=1&pageSize=20&endDate=<YYYYMMDD>&access_source=H5
```

Returns paginated NAV history, newest-first.

| Property        | Value          |
| --------------- | -------------- |
| Login required  | No             |
| Encryption      | No             |
| Signing         | No             |
| Legacy TLS      | No             |
| Pagination      | **Yes** — `pageNum` / `pageSize` (server caps `pageSize` at 20). Paginate backwards using `endDate` set to the oldest date from the previous page. |
| Search by code  | N/A (takes a single `prdCode`) |

**Response fields (`data.list[]`):**

| Field               | Description                                        |
| ------------------- | -------------------------------------------------- |
| `nav`               | Unit NAV (string)                                  |
| `totNav`            | Accumulated NAV (string)                           |
| `yeildDate`         | NAV date, format `YYYYMMDD` (typo in API name)     |
| `data.totalNum`     | Total number of entries across all pages           |

See [examples/finaChildQuotationList.do.json](examples/finaChildQuotationList.do.json).

---

## Notes

- Top-level response shape: `{"responseCode": "000000", "data": {...}}`. Check `responseCode == "000000"` for success.
- Current implementation fetches the latest 20 entries in one call without paginating further.
