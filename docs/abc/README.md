# abc — 中国农业银行 (Agricultural Bank of China)

Source key: `abc` | Issuers: 农银理财, 苏银理财, 法巴农银理财, others | Ticker format: `NYJQLDGSZQ60`

The ticker is the `productExtId` shown in API responses (alphanumeric, no fixed length). Find it via the list or search APIs, or from the detail page URL parameter `id`.

## Pages

### List page

`https://ewealth.abchina.com.cn/fs/filter/default.htm?prodLimit=60%E5%A4%A9%E4%BB%A5%E4%B8%8B&saleSate=%E5%BD%93%E5%89%8D%E5%9C%A8%E5%94%AE`

The ticker (`productExtId`) is visible in search results and detail page URLs.

### Detail page

`https://ewealth.abchina.com.cn/fs/index.htm?id=NYJQLDGSZQ60`

The `id` query parameter is the ticker. **The CBIRC register code is not exposed on any ABC API page.**

## APIs

### Quick search — POST /app/data/api/DataService/ProxyProdquickFind

```
curl 'https://ewealth.abchina.com.cn/app/data/api/DataService/ProxyProdquickFind' \
  -H 'Accept: application/json, text/plain, */*' \
  -H 'Accept-Language: en-GB,en-US;q=0.9,en;q=0.8' \
  -H 'Cache-Control: no-cache' \
  -H 'Connection: keep-alive' \
  -H 'Content-Type: application/json' \
  -b $'Path=/; BIGipServerpool_pt_ewealth=!jcqRr2M82tVZRUEor/Ji0wauWLyUmlnepVU3eDihiWAWwtj4yBUFB68vAdC35bPXRIbXCHlXiDj6bmY=; BIGipServerpool_pt_ewealth_app=!XDQEKKX1RrsuywPq6ZWoJ+kD19At1VoE57T06sxEA3ip79QjC8TF4q37xVDA2AjB9BPa6w4MRNsJ; Path=/' \
  -H 'Origin: https://ewealth.abchina.com.cn' \
  -H 'Pragma: no-cache' \
  -H 'Referer: https://ewealth.abchina.com.cn/fs/' \
  -H 'Sec-Fetch-Dest: empty' \
  -H 'Sec-Fetch-Mode: cors' \
  -H 'Sec-Fetch-Site: same-origin' \
  -H 'User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1' \
  -H 'sec-ch-ua: "Not/A)Brand";v="99", "Chromium";v="148"' \
  -H 'sec-ch-ua-mobile: ?1' \
  -H 'sec-ch-ua-platform: "iOS"' \
  --data-raw '{"data":{"keyword":"NYJQLDFOF720S"}}'
```

Simplified: `POST https://ewealth.abchina.com.cn/app/data/api/DataService/ProxyProdquickFind` with body `{"data":{"keyword":"<query>"}}`

| Property          | Value                                           |
| ----------------- | ----------------------------------------------- |
| Login required    | No                                              |
| Encryption        | No                                              |
| Signing           | No                                              |
| Legacy TLS        | Yes                                             |
| Pagination        | Unknown — only `totalRecs` observed, no page param tested |
| Search by keyword | Yes — `keyword` field (product name or ticker)  |
| Search by code    | Yes — `keyword` field accepts `productExtId`    |

Response fields (`result.Table[]`):

| Field          | Description          |
| -------------- | -------------------- |
| `productExtId` | Ticker               |
| `productName`  | Full Chinese name    |

Example: [examples/ProxyProdquickFind.json](examples/ProxyProdquickFind.json)

### Product detail — POST /app/data/api/DataService/FsProdInfo

```
curl 'https://ewealth.abchina.com.cn/app/data/api/DataService/FsProdInfo' \
 -H 'Accept: application/json, text/plain, _/_' \
 -H 'Accept-Language: en-GB,en-US;q=0.9,en;q=0.8' \
 -H 'Cache-Control: no-cache' \
 -H 'Connection: keep-alive' \
 -H 'Content-Type: application/json' \
 -b $'Path=/; BIGipServerpool_pt_ewealth=!jcqRr2M82tVZRUEor/Ji0wauWLyUmlnepVU3eDihiWAWwtj4yBUFB68vAdC35bPXRIbXCHlXiDj6bmY=; BIGipServerpool_pt_ewealth_app=!XDQEKKX1RrsuywPq6ZWoJ+kD19At1VoE57T06sxEA3ip79QjC8TF4q37xVDA2AjB9BPa6w4MRNsJ; Path=/' \
 -H 'Origin: https://ewealth.abchina.com.cn' \
 -H 'Pragma: no-cache' \
 -H 'Referer: https://ewealth.abchina.com.cn/fs/index.htm?id=NYJQLDGSZQ60' \
 -H 'Sec-Fetch-Dest: empty' \
 -H 'Sec-Fetch-Mode: cors' \
 -H 'Sec-Fetch-Site: same-origin' \
 -H 'User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1' \
 -H 'sec-ch-ua: "Not/A)Brand";v="99", "Chromium";v="148"' \
 -H 'sec-ch-ua-mobile: ?1' \
 -H 'sec-ch-ua-platform: "iOS"' \
 --data-raw '{"data":{"keyword":"NYJQLDGSZQ60"}}'
```

Simplified: `POST https://ewealth.abchina.com.cn/app/data/api/DataService/FsProdInfo` with body `{"data":{"keyword":"<ticker>"}}`

| Property          | Value         |
| ----------------- | ------------- |
| Login required    | No            |
| Encryption        | No            |
| Signing           | No            |
| Legacy TLS        | No            |
| Pagination        | N/A           |
| Search by keyword | Yes — `keyword` field accepts `productExtId` |
| Search by code    | Yes           |

Response fields (`result.Table` — dict when fetching single product, list when multiple match):

| Field            | Description                                |
| ---------------- | ------------------------------------------ |
| `productExtId`   | Ticker                                     |
| `productName`    | Full Chinese name                          |
| `productSource`  | Issuer name (e.g. 农银理财有限责任公司)     |
| `prodOpenClose`  | Open/closed type                           |
| `investTerm`     | Minimum holding period                     |
| `mkrdBaseDscr`   | Benchmark yield range                      |
| `productIncomeTy`| Income type                               |
| `purStarAmo`     | Minimum purchase amount (CNY)              |
| `saleState`      | Sale status (今日在售 / 销售完成 / etc.)   |
| `risk`           | Risk level                                 |
| `estblDate`      | Establishment date (YYYYMMDD, may be null) |
| `matuDate`       | Maturity date (YYYYMMDD, may be null)      |

**Note:** No CBIRC register code is present in this response.

Example: [examples/FsProdInfo.json](examples/FsProdInfo.json)

### Product list — POST /app/data/api/DataService/ProxyProdList

```
curl 'https://ewealth.abchina.com.cn/app/data/api/DataService/ProxyProdList' \
  -H 'Accept: application/json, text/plain, */*' \
  -H 'Accept-Language: en-GB,en-US;q=0.9,en;q=0.8' \
  -H 'Cache-Control: no-cache' \
  -H 'Connection: keep-alive' \
  -H 'Content-Type: application/json' \
  -b $'Path=/; BIGipServerpool_pt_ewealth=!jcqRr2M82tVZRUEor/Ji0wauWLyUmlnepVU3eDihiWAWwtj4yBUFB68vAdC35bPXRIbXCHlXiDj6bmY=; BIGipServerpool_pt_ewealth_app=!XDQEKKX1RrsuywPq6ZWoJ+kD19At1VoE57T06sxEA3ip79QjC8TF4q37xVDA2AjB9BPa6w4MRNsJ; Path=/' \
  -H 'Origin: https://ewealth.abchina.com.cn' \
  -H 'Pragma: no-cache' \
  -H 'Referer: https://ewealth.abchina.com.cn/fs/filter/default.htm' \
  -H 'Sec-Fetch-Dest: empty' \
  -H 'Sec-Fetch-Mode: cors' \
  -H 'Sec-Fetch-Mode: cors' \
  -H 'Sec-Fetch-Site: same-origin' \
  -H 'User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1' \
  -H 'sec-ch-ua: "Not/A)Brand";v="99", "Chromium";v="148"' \
  -H 'sec-ch-ua-mobile: ?1' \
  -H 'sec-ch-ua-platform: "iOS"' \
  --data-raw '{"data":{"saleState":"","investTerm":"","prodOpenClose":"","investMoneyTy":"","risk":"","purStarAmo":"0","saleArea":"","orderBy":"0","orderByAsc":"1","pageIndex":1,"pageSize":15}}'
```

Pagination params: `pageIndex` (1-based), `pageSize`. `result.Table1` reports `totalRecs`, `totalPages`, `current`, `size`.

Example: [examples/ProxyProdList.json](examples/ProxyProdList.json)

### NAV history — GET /app/data/api/DataService/OwnProdNetValueFilterV3

```
curl 'https://ewealth.abchina.com.cn/app/data/api/DataService/OwnProdNetValueFilterV3?i=1&s=15&w=NYJQLDGSZQ60' \
 -H 'Accept: application/json, text/javascript, _/_; q=0.01' \
 -H 'Accept-Language: en-GB,en-US;q=0.9,en;q=0.8' \
 -H 'Cache-Control: no-cache' \
 -H 'Connection: keep-alive' \
 -b $'Path=/; BIGipServerpool_pt_ewealth=!jcqRr2M82tVZRUEor/Ji0wauWLyUmlnepVU3eDihiWAWwtj4yBUFB68vAdC35bPXRIbXCHlXiDj6bmY=; BIGipServerpool_pt_ewealth_app=!XDQEKKX1RrsuywPq6ZWoJ+kD19At1VoE57T06sxEA3ip79QjC8TF4q37xVDA2AjB9BPa6w4MRNsJ; Path=/' \
 -H 'Pragma: no-cache' \
 -H 'Referer: https://ewealth.abchina.com.cn/fs/default_netvalue/jingzhi_kf/default.htm?w=NYJQLDGSZQ60' \
 -H 'Sec-Fetch-Dest: empty' \
 -H 'Sec-Fetch-Mode: cors' \
 -H 'Sec-Fetch-Site: same-origin' \
 -H 'User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1' \
 -H 'X-Requested-With: XMLHttpRequest' \
 -H 'sec-ch-ua: "Not/A)Brand";v="99", "Chromium";v="148"' \
 -H 'sec-ch-ua-mobile: ?1' \
 -H 'sec-ch-ua-platform: "iOS"'
```

Simplified: `GET https://ewealth.abchina.com.cn/app/data/api/DataService/OwnProdNetValueFilterV3?i=<page>&s=<size>&w=<ticker>`

| Property             | Value                                            |
| -------------------- | ------------------------------------------------ |
| Login required       | No                                               |
| Encryption           | No                                               |
| Signing              | No                                               |
| Legacy TLS           | Yes                                              |
| Pagination           | Yes — `i` (page, 1-based), `s` (page size); `Data.Table1[0].total` gives full count |
| Arbitrary time range | No — sorted newest-first only; paginate to go back |

Response fields (`Data.Table[]`):

| Field         | Description                      |
| ------------- | -------------------------------- |
| `ProdNo`      | Ticker                           |
| `Prodname`    | Product name                     |
| `NetValue`    | Unit NAV                         |
| `accNetValue` | Accumulated NAV                  |
| `NetDate`     | Date in `YYYY-MM-DD` format      |
| `ProdType`    | Product type (开放 / 封闭)       |

`Data.Table1[0].total` — total number of NAV records (1152 observed for NYJQLDGSZQ60).

Results are sorted newest-first. No date range filter parameter — paginate to retrieve history.

Example: [examples/OwnProdNetValueFilterV3.json](examples/OwnProdNetValueFilterV3.json)

## Notes

- **No register code**: None of the ABC APIs expose the CBIRC register code (`register_code` is always `None`). Use `china-wealth lookup` with the product name to find it on 中国理财网 if needed.
- The platform is a true bank channel — multiple issuers confirmed: 农银理财有限责任公司, 苏银理财有限责任公司, 法巴农银理财有限责任公司.
- Cookies in the captured curl commands are session cookies from BIG-IP load balancers. Live testing confirms all endpoints work without cookies.
- `FsProdInfo` returns a dict under `result.Table` for a precise ticker match, but a list when multiple products match — the implementation handles both shapes.
