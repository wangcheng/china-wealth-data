# ccb_wm — 建信理财 (CCB Wealth Management)

Source key: `ccb_wm` | Issuers: 建信理财 | Ticker: numeric page slug, e.g. `9783965`

---

## Pages

### List page

URL: `https://www.wealthccb.com/productList.html`

Browse products. Click through to the detail page to get the numeric slug from the URL.

### Detail page

URL: `https://www.wealthccb.com/product/<slug>.html`

The numeric `<slug>` in the URL is the ticker (e.g. `9783965`). This slug differs from the user-facing product ID shown in the product name. There is currently **no known API** to map a user-facing product ID to a slug; the slug must be found manually via the list page.

The CBIRC register code (登记编码) is **not exposed** on the CCB Wealth page. To find it, check the product's 产品基本信息 section or the 产品说明书 PDF.

---

## APIs

There is **no JSON API**. Data is extracted via HTML scraping of the detail page.

### Product detail — `GET /product/<slug>.html`

```
GET https://www.wealthccb.com/product/<slug>.html
```

Server-rendered HTML. All data extracted via regex from the DOM.

| Property        | Value          |
| --------------- | -------------- |
| Login required  | No             |
| Encryption      | No             |
| Signing         | No             |
| Legacy TLS      | No             |
| Pagination      | N/A — single page, latest NAV only |
| Search by code  | No — slug must be known in advance |

**Key HTML patterns:**

| Data           | Pattern |
| -------------- | ------- |
| Product name   | `<h4 class="cp-title">Name <span>(Code)</span></h4>` |
| Latest NAV     | `<p class="firtst">1.028568</p>` |
| NAV date       | `<p class="second">最新净值(YYYY-MM-DD)</p>` |
| Register code  | **Not on page** |

**Embedded NAV series (JavaScript):**

The page includes an `echartsBox()` script block with parallel `xData` (dates as `YYYYMMDD`) and `sData` (NAV values) arrays for multiple time ranges: `week`, `month`, `byear`, `yyear`, `all`. The `bool=true` branch of `sData` holds accumulated NAV; `bool=false` holds unit NAV.

```javascript
if (bool) {
  sData = [ /* 累计净值 values */ ];
} else {
  sData = [ /* 单位净值 values */ ];
}
```

Current implementation uses regex to extract the latest value. Full series extraction from `xData`/`sData` would support `get_prices_series()` in the future.

See [examples/page.html](examples/page.html).

---

## Notes

- The page slug is different from the user-facing product ID — there is no known lookup API. The slug must be discovered manually from the product list page URL.
- Accumulated NAV is embedded in the JS `echartsBox` block but is not currently exposed by the source.
- **TODO**: Investigate whether an XHR/JSON API endpoint exists for this site.
- **TODO**: Implement more robust JS parsing with `dukpy` instead of regex (see previous TODO section for implementation plan).
