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

NAV and metadata are embedded in the page HTML as inline JSON. The current implementation uses regex extraction to parse:

| Pattern | Field |
|---------|-------|
| `"productName": "..."` | Product name |
| `"registerCode": "..."` | CBIRC register code |
| `"unitNav": <value>` | Unit NAV |
| `"navDate": "..."` | NAV date |

## TODO

- [ ] Discover an API or mapping to resolve user-facing product ID → page slug
- [ ] Add example response once mapping is confirmed
