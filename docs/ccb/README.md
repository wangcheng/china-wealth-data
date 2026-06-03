# CCB Wealth (建信理财)

## Overview

CCB Wealth (建信理财有限责任公司) is the wealth management subsidiary of China Construction Bank (建设银行).

## Known Issue: Product ID vs Page Slug

CCB product pages use a numeric page slug that is **different** from the user-facing product ID. For example:

- User-facing ID: `AF233364A` (format matches other issuers)
- Page URL: `https://www.wealthccb.com/product/9783965.html`

The mapping from product ID to page slug has not yet been determined. Until a lookup API or static mapping is available, the numeric slug must be passed directly as the ticker.

## Page Structure

```
GET https://www.wealthccb.com/product/<slug>.html
```

The page is server-rendered HTML with **no inline JSON or structured data**. All data is extracted from the DOM via regex.

### Key HTML patterns

| Data           | HTML pattern |
|----------------|-------------|
| Product name   | `<h4 class="cp-title">Name <span>(Code)</span></h4>` |
| Latest NAV     | `<li…><p class="firtst">1.028568</p><p class="second">最新净值(2026-06-01)</p></li>` |
| NAV date       | Extracted from `最新净值(YYYY-MM-DD)` in the same block |
| Register code  | **Not exposed** on the product page |

### NAV date format

The NAV date in the "最新净值" label uses `YYYY-MM-DD` format (e.g. `2026-06-01`).

### Historical data

The page contains historical NAV series in inline JavaScript (`echartsBox()` calls with `xData`/`sData` arrays containing YYYYMMDD dates and numeric NAV values). This could be parsed for `get_prices_series()` support in the future.

## TODO

- [ ] Discover an API or mapping to resolve user-facing product ID → page slug
- [ ] Parse echarts JavaScript for historical NAV series support
- [ ] Investigate whether an API endpoint serves JSON (check XHR requests made by the page)
