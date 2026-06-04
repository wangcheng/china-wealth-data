# hsbc_bank source

Data backend: HSBC Bank China investment platform API (`www.hsbc.com.cn`).

Sells products from 施罗德交银理财 and other issuers. Products are identified by
a sub-share code (CBIRC sub-share / fund code), e.g. `182481005A`.

## API

**Base URL:** `https://www.hsbc.com.cn/api/wealth-cn-srbp-shp-api-cn-anonymous-prod-proxy/v0/ut`

All requests require the header `x-hsbc-chnl-countrycode: CN`.

### Product detail

```
GET /v2/productDetail/WMP/CN/<ticker>
```

Returns product metadata and latest NAV in a single response. No authentication required.

### NAV history

```
GET /performanceHist/WMP/CN/<ticker>?date=3Y
```

Returns up to 3 years of daily NAV history. `date` accepts `1M`, `3M`, `6M`, `1Y`, `3Y`.

## Response field reference

| Field | Description |
|---|---|
| `prodPllName` | Product name |
| `cdcCde` | CBIRC register code (登记编码), e.g. `Z7007024000248` |
| `nav` | Unit NAV (单位净值) |
| `tolNav` | Accumulated/total NAV (累计净值) |
| `issDate` | NAV date, format `YYYY-MM-DD HH:MM:SS` (truncate to date) |
| `performanceList[].unitNetWorth` | Unit NAV for history entry |
| `performanceList[].cumulativeNetWorth` | Accumulated NAV for history entry |
| `performanceList[].date` | Date, format `YYYY-MM-DD` |

## Usage

```bash
china-wealth info   hsbc_bank 182481005A
china-wealth nav    hsbc_bank 182481005A
```

## Beancount / bean-price

```
price: china_wealth.sources.hsbc_bank/182481005A
```
