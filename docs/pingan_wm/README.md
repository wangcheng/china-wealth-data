# pingan_wm — 平安理财

Data source for products sold on **wm.pingan.com** (平安理财有限责任公司).

Products are identified by **productCode** (份额代码), e.g. `LHCZGS141I`.

- Browse products: https://wm.pingan.com/#/product
- Product detail: https://wm.pingan.com/#/product/productDetail?productCode=LHCZGS141I&raiseType=0

The `productCode` appears in the detail page URL.

> **Note:** This source is different from `pingan_bank` which uses the older
> Ping An Bank API (`rmb.pingan.com.cn`).

## Endpoints

Base URL: `https://wmm.pingan.com.cn/app`

### GET `/product/getProductInfo`

Returns product metadata. No NAV is included.

**Request:**

```
GET /product/getProductInfo?productCode=LHCZGS141I
Origin: https://wm.pingan.com
Referer: https://wm.pingan.com/
```

**Response fields:**

| Field                | Description                                       |
| -------------------- | ------------------------------------------------- |
| `productName`        | Full product name                                 |
| `productSname`       | Short name (used as `name`)                       |
| `productCode`        | Share code (ticker)                               |
| `parentProductCode`  | Parent product code                               |
| `registerCode`       | CBIRC register code                               |
| `institutionCodeTxt` | Issuer name (e.g. 平安理财有限责任公司)           |
| `productStatusTxt`   | Status (e.g. 存续中)                              |
| `multiShareProduct`  | `"1"` if this is a share of a multi-share product |

### POST `/nvl/getNvlView`

Returns full NAV history for a product share.

**Encryption:** The request body is SM4 (国密SM4) ECB mode, PKCS#7 padding,
with a static key `B34440569682494CCADDAA9D603961D2`, hex-encoded as the body.

**Content-Type:** `application/json` (despite the body being a hex string)

**Plaintext payload:**

```json
{
  "productId": "LHCZGS141I",
  "currentTimeMillis": "<unix millis as string>",
  "pageNum": 0,
  "pageSize": 0,
  "startDate": "2025-01-01",
  "endDate": "2026-06-04",
  "uuid": "<random UUID>"
}
```

- `pageNum=0, pageSize=0` returns all records in the date range (no pagination).
- `startDate`/`endDate` are `null` to get all history.
- `currentTimeMillis` must be present and current (server validates it).
- `uuid` must be present (server rejects requests without it).

**Response:** `data` is an array of NAV entries:

| Field             | Description                               |
| ----------------- | ----------------------------------------- |
| `dataDate`        | Date (`YYYY-MM-DD`)                       |
| `unitValue`       | Unit NAV (单位净值)                       |
| `cumulativeValue` | Accumulated NAV (累计净值)                |
| `assetsValue`     | Assets value (usually `null`)             |
| `profit`          | Daily profit (`0.0000` for most products) |
| `yield`           | Daily yield (`0.0000` for most products)  |

## Encryption details

The SM4 algorithm is a Chinese national standard block cipher (GB/T 32907-2016),
equivalent in structure to AES but with different S-box and key schedule constants.
The key was extracted from the web bundle's module 221 (`_.c`).

The JS encryption call (module 400, function `L`):

```js
function L(E) {
  return J.encrypt(E, t.c);
} // t.c = "B34440569682494CCADDAA9D603961D2"
```

Mode: ECB (no IV). Padding: PKCS#7. Output: lowercase hex string.
