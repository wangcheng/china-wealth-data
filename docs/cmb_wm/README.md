# CMB Wealth Management (招银理财)

## Overview

CMB Wealth Management (招银理财有限责任公司) is the wealth management subsidiary of China Merchants Bank (招商银行).

## Finding a Product

The public offering product list is at:

```
https://www.cmbchinawm.com/publicOffering
```

The product detail page URL uses `prodTradeCode` and `prodClcMode` query parameters:

```
https://www.cmbchinawm.com/proDetail?prodTradeCode=<prodTradeCode>&prodClcMode=01&finType=P
```

Example: `https://www.cmbchinawm.com/proDetail?prodTradeCode=129106A&prodClcMode=01&finType=P`

The CBIRC register code (登记编码) can be found in the product's 产品基本信息 section on the detail page, or in the 产品说明书 PDF.

## Implementation Status

Not yet implemented. API endpoints and response field reference are TBD — capture XHR requests from the detail page to identify them.
