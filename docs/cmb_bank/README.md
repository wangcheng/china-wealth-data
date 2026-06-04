# CMB Bank (招商银行) source

Source key: `cmb_bank`

Serves wealth products distributed through CMB Bank's channel (招商银行). Products from
third-party issuers such as 建信理财 are included.

Ticker format: `prdCode` (= `funCod`), e.g. `JXPB0201`.

## Finding a ticker

**Step 1 — search by keyword** at https://finprod.paas.cmbchina.com/ to find the
`prdCode`. Use the search box on that page, or call the API directly. Set `keyWords`
to a product name fragment to filter, or leave it empty to list all products:

```bash
curl 'https://finprod.paas.cmbchina.com/api/prod/queryProdList' \
  -H 'accept: application/json' \
  -H 'accept-language: en-GB,en-US;q=0.9,en;q=0.8' \
  -H 'appid: FinProd' \
  -H 'content-type: application/json;charset=UTF-8' \
  -b 'JWCurrUploadId=undefined' \
  -H 'origin: https://finprod.paas.cmbchina.com' \
  -H 'priority: u=1, i' \
  -H 'referer: https://finprod.paas.cmbchina.com/' \
  -H 'sec-ch-ua: "Not/A)Brand";v="99", "Chromium";v="148"' \
  -H 'sec-ch-ua-mobile: ?0' \
  -H 'sec-ch-ua-platform: "macOS"' \
  -H 'sec-fetch-dest: empty' \
  -H 'sec-fetch-mode: cors' \
  -H 'sec-fetch-site: same-origin' \
  -H 'signature: WygmJfbfTdsun71uOf7H+azYJC6ZHM+74gJF2XLq9PU=' \
  -H 'timespan: 1780586615120' \
  -H 'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36' \
  -H 'x-b3-businessid: LB502215022898' \
  -H 'x-b3-parentspanid: 0a6b320064e805f7' \
  -H 'x-b3-sampled: 1' \
  -H 'x-b3-spanid: 80abddc752d3990f' \
  -H 'x-b3-timestamp: 1780586615120' \
  -H 'x-b3-traceid: acb5d3540a6b320064e805f7d1f98d05' \
  --data-raw '{"keyWords":"","type":"PN","isOwn":"A","isPublic":"Z","status":"0","pageNO":1,"pageSize":50,"crossFinance":"Z","riskLevel":"","obligate":""}'
```

Replace `"keyWords":""` with a product name to filter results, e.g.
`"keyWords":"建信理财睿鑫固收类最低持有1年产品第3期"`. The `code` field in each
result is the ticker (`prdCode`).

**Step 2 — confirm NAV history** at https://cfweb.paas.cmbchina.com/personal/prodvalue.aspx
using the `prdCode` from step 1.

## Endpoints

All under `https://cfweb.paas.cmbchina.com`.

### Product info

```
POST /api/ProductInfo/getproductbyprdcode?prdCode=<prdCode>
```

No request body. Returns a list; the first element contains the product.

```bash
curl 'https://cfweb.paas.cmbchina.com/api/ProductInfo/getproductbyprdcode?prdCode=JXPB0201' \
  -X 'POST' \
  -H 'accept: */*' \
  -H 'accept-language: en-GB,en-US;q=0.9,en;q=0.8' \
  -H 'appid: LB50.22_CFWebUI' \
  -H 'content-length: 0' \
  -H 'origin: https://cfweb.paas.cmbchina.com' \
  -H 'priority: u=1, i' \
  -H 'referer: https://cfweb.paas.cmbchina.com/personal/prodvalue.aspx' \
  -H 'sec-ch-ua: "Not/A)Brand";v="99", "Chromium";v="148"' \
  -H 'sec-ch-ua-mobile: ?0' \
  -H 'sec-ch-ua-platform: "macOS"' \
  -H 'sec-fetch-dest: empty' \
  -H 'sec-fetch-mode: cors' \
  -H 'sec-fetch-site: same-origin' \
  -H 'signature: CH7RbAkH+GZuarNpKS02IimQ7PSicB51nB0qB8exriA=' \
  -H 'timespan: 1780585466282' \
  -H 'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36' \
  -H 'x-b3-businessid: LB502215022970' \
  -H 'x-b3-parentspanid: 1c51c26ee80db6a0' \
  -H 'x-b3-sampled: 1' \
  -H 'x-b3-spanid: e569e98456250716' \
  -H 'x-b3-timestamp: 1780585466283' \
  -H 'x-b3-traceid: b8f4dff71c51c26ee80db6a06c545f6b'
```

### Product detail (alternative)

```bash
curl 'https://cfweb.paas.cmbchina.com/api/ProductInfo/getSAProductDetailInfo?saaCod=D07&funCod=JXPB0201' \
-X 'POST' \
-H 'accept: */*' \
-H 'accept-language: en-GB,en-US;q=0.9,en;q=0.8' \
-H 'appid: LB50.22_CFWebUI' \
-H 'content-length: 0' \
-H 'origin: https://cfweb.paas.cmbchina.com' \
-H 'priority: u=1, i' \
-H 'referer: https://cfweb.paas.cmbchina.com/personal/prodvalue.aspx' \
-H 'sec-ch-ua: "Not/A)Brand";v="99", "Chromium";v="148"' \
-H 'sec-ch-ua-mobile: ?0' \
-H 'sec-ch-ua-platform: "macOS"' \
-H 'sec-fetch-dest: empty' \
-H 'sec-fetch-mode: cors' \
-H 'sec-fetch-site: same-origin' \
-H 'signature: CH7RbAkH+GZuarNpKS02Ivhnl4yArwDUj8ERiwJOTfQ=' \
-H 'timespan: 1780585466399' \
-H 'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36' \
-H 'x-b3-businessid: LB502215022970' \
-H 'x-b3-parentspanid: 15f50e896a6d3bec' \
-H 'x-b3-sampled: 1' \
-H 'x-b3-spanid: abb943a54dce607d' \
-H 'x-b3-timestamp: 1780585466399' \
-H 'x-b3-traceid: 2efe4e7d15f50e896a6d3becb1cabd56'
```

### NAV history

```
POST /api/ProductValue/getSAValueByPageOrDate
Content-Type: application/json;charset=UTF-8

{
  "saaCod": "<saaCod>",
  "funCod": "<prdCode>",
  "pageIndex": 1,
  "pageSize": 50,
  "startDate": "",
  "endDate": ""
}
```

`saaCod` is a short category code (e.g. `D07`) returned by the product info endpoint.
It must be paired with `funCod` for NAV queries.

```bash
curl 'https://cfweb.paas.cmbchina.com/api/ProductValue/getSAValueByPageOrDate' \
  -H 'accept: application/json' \
  -H 'accept-language: en-GB,en-US;q=0.9,en;q=0.8' \
  -H 'appid: LB50.22_CFWebUI' \
  -H 'content-type: application/json;charset=UTF-8' \
  -H 'origin: https://cfweb.paas.cmbchina.com' \
  -H 'priority: u=1, i' \
  -H 'referer: https://cfweb.paas.cmbchina.com/personal/prodvalue.aspx' \
  -H 'sec-ch-ua: "Not/A)Brand";v="99", "Chromium";v="148"' \
  -H 'sec-ch-ua-mobile: ?0' \
  -H 'sec-ch-ua-platform: "macOS"' \
  -H 'sec-fetch-dest: empty' \
  -H 'sec-fetch-mode: cors' \
  -H 'sec-fetch-site: same-origin' \
  -H 'signature: CH7RbAkH+GZuarNpKS02Iu6uyOUmI4Mm0BbIWlG+y2s=' \
  -H 'timespan: 1780585466675' \
  -H 'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36' \
  -H 'x-b3-businessid: LB502215022970' \
  -H 'x-b3-parentspanid: cd88b7067ed331a5' \
  -H 'x-b3-sampled: 1' \
  -H 'x-b3-spanid: 916927c9c0c485e5' \
  -H 'x-b3-timestamp: 1780585466675' \
  -H 'x-b3-traceid: b215e75ccd88b7067ed331a50bf959a1' \
  --data-raw '{"saaCod":"D07","funCod":"JXPB0201","pageIndex":1,"pageSize":10,"startDate":"","endDate":""}'
```

## Required headers

Every request to `cfweb.paas.cmbchina.com` needs `appid`, `timespan`, and `signature`:

| Header      | Value / computation                                                     |
| ----------- | ----------------------------------------------------------------------- |
| `appid`     | `LB50.22_CFWebUI` (static)                                              |
| `timespan`  | Current Unix timestamp in milliseconds                                  |
| `signature` | SM4-ECB encrypt `"LB50.22_CFWebUI|<timespan>"`, base64-encode result   |

### Signature algorithm (from `umi.js`)

- **Algorithm**: SM4 (国密) in ECB mode, PKCS7 padding
- **Key**: base64-decode `NXF3QkdqdTczSkFYaWQ0RA==` → 16-byte key (`5qwBGju73JAXid4D`)
- **Plaintext**: UTF-8 bytes of `"LB50.22_CFWebUI|<timespan_ms>"`
- **Output**: base64-encode the ciphertext

Key constant extracted from `AUTH_SN` in `umi.js` (lines ~116494–116575).

## Response field reference

### Product info (`getproductbyprdcode`)

| Field      | Description                                                         |
| ---------- | ------------------------------------------------------------------- |
| `prdCode`  | Product code (= ticker)                                             |
| `prdName`  | Full product name                                                   |
| `regCode`  | CBIRC register code                                                 |
| `saaCod`   | Category code (needed for NAV queries)                              |
| `funCod`   | Fund code (= `prdCode`)                                             |
| `comNam`   | Issuer company name                                                 |
| `netValue` | Latest NAV (string, often empty — use NAV history endpoint instead) |

### NAV history (`getSAValueByPageOrDate`)

Response: `body.totalRecord`, `body.totalPage`, `body.data[]`

| Field     | Description              |
| --------- | ------------------------ |
| `znavDat` | NAV date (`YYYYMMDD`)    |
| `znavVal` | Unit NAV (string)        |
| `znavCtl` | Accumulated NAV (string) |
| `zripSnm` | Product short name       |
| `zsaaCod` | Category code            |
| `zripInn` | Fund code                |

## Quirks

- `netValue` in the product info response is often an empty string; use the NAV
  history endpoint for actual NAV data.
- `saaCod` must be fetched from the product info endpoint before calling the NAV
  history endpoint.
- Pagination: `pageIndex` / `pageSize` supported. Max observed page size is 50.
