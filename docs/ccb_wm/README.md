# CCB Wealth (建信理财)

## Overview

CCB Wealth (建信理财有限责任公司) is the wealth management subsidiary of China Construction Bank (建设银行).

## Finding a Product and Its Slug

CCB product pages use a numeric page slug that is **different** from the user-facing product ID. For example:

- User-facing ID: `AF233364A` (format matches other issuers)
- Page URL: `https://www.wealthccb.com/product/9783965.html`

**To find the slug for a product:**

1. Browse or search the product list at `https://www.wealthccb.com/productList.html`
2. Click through to the product detail page — the URL will be `https://www.wealthccb.com/product/<slug>.html`
3. Use the numeric slug as the ticker (e.g. `9783965`)

The CBIRC register code (登记编码) is **not exposed** on the CCB product page. To find it, check the product's 产品基本信息 section or the 产品说明书 PDF — it is documented there. Once known, cross-reference with `china-wealth lookup <register_code>` via 中国理财网.

Until a lookup API or static mapping from user-facing ID to slug is available, the numeric slug must be passed directly as the ticker.

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

### Unit NAV vs Accumulated NAV

The page exposes a toggle between 单位净值 (unit NAV) and 累计净值 (accumulated NAV). Both series are embedded as parallel JS arrays inside `echartsBox()`:

```javascript
if (bool) {
  sData = [ /* 累计净值 values */ ];
} else {
  sData = [ /* 单位净值 values */ ];
}
```

The `<p class="firtst">` block only shows a single latest value (单位净值). The accumulated NAV must be extracted from the `bool=true` sData array.

Currently `_extract_accumulated_nav()` in `ccb.py` uses regex to find the last value of the `bool=true` array in the 成立以来 (all-time) section.

### Historical data

The `echartsBox()` function contains four time ranges (`week`, `month`, `byear`, `yyear`, `all`), each with parallel `xData` (YYYYMMDD dates) and `sData` (NAV values) arrays. This covers up to the full inception history and could power `get_prices_series()`.

## TODO

- [ ] Discover an API or mapping to resolve user-facing product ID → page slug
- [ ] Investigate whether an API endpoint serves JSON (check XHR requests made by the page)

### Robust JS parsing with dukpy

Currently NAV extraction uses regex on the raw JS source, which is fragile if CCB changes code formatting or minifies the page.

**Plan**: replace regex with [dukpy](https://github.com/matthiasbayer/dukpy) (Duktape JS engine) to evaluate the script block directly.

Implementation steps:

1. Add `dukpy` to `pyproject.toml` dependencies.
2. Extract the `<script>` block containing `echartsBox` from the HTML.
3. Prepend stubs for browser globals that the script references:
   ```javascript
   var $ = function() { return { css: function(){} }; };
   var echarts = { init: function() { return { setOption: function(){} }; } };
   var document = { getElementById: function() { return null; } };
   var myChart;
   ```
4. Append calls to capture output:
   ```javascript
   echartsBox("all", false, false);  // unit NAV → sData
   var unitSData = sData;
   echartsBox("all", false, true);   // accumulated NAV → sData
   var accumSData = sData;
   [unitSData[unitSData.length-1], accumSData[accumSData.length-1]]
   ```
5. Call `dukpy.evaljs(script)` and read the returned `[unit_nav, accum_nav]` pair.
6. For `get_prices_series()`: capture `xData` and `sData` from the `"all"` branch to build the full history as `NavEntry` list.
