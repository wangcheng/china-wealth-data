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

Example: `https://www.cmbchinawm.com/proDetail?prodTradeCode=109405A&prodClcMode=01&finType=P`

The CBIRC register code (登记编码) appears as `prodRegId` in the `getProductDetail` API response.

## Request Encryption

All API requests use **SM2** (国密椭圆曲线) asymmetric encryption. The request body is the
SM2-encrypted JSON, hex-encoded, in **C1+C3+C2** format (GB/T 32918.4 mode 1) with the
C1 ephemeral public key point prefixed by `04`.

SM2 public key (uncompressed, without `04` prefix), assembled from split literals in `app.js`:

```
cf98844d3ddf6b87e124fba422e64e0b93e9bf83aff6fb8e246c0582567390099
bfcb6563290e9a015f42a382053ceb3c95530201da6c8f1ba140774f3bc6a87
```

## Headers

| Header | Required | Value |
|---|---|---|
| `User-Agent` | **Yes** | Browser UA string — WAF returns 403 without it |
| `Referer` | **Yes** | `https://www.cmbchinawm.com/` — WAF returns 403 without it |
| `Content-Type` | **Yes** | `application/json` — server returns 500 without it |
| `tns` | No | `<timestamp_ms>,<random10digit>,<sha1(random10digit)>` |
| `x-b3-businessid` | No | `LR5801PC_WEB` |

The `tns` third part is SHA1 of the decimal string of the random number. It is generated
per-request in the browser but the server does not validate it.

## API Endpoints

Base URL: `https://www.cmbchinawm.com/prod-api`

All endpoints: POST, body = SM2-encrypted JSON (hex).

### Product Detail

```
POST /web/api/product/getProductDetail/<prodClcMode>
Body: {"prodTradeCode": "<code>"}
```

`prodClcMode` is the product's calculation mode. It appears in the detail page URL as `?prodClcMode=01`. The page component reads it from the URL and falls back to `'01'` if absent (`this.$route.query.prodClcMode || '01'`), so `01` is the correct universal default — it is not a per-product value that varies in practice.

Response `data` fields:

| Field | Description |
|---|---|
| `csName` | Product name |
| `prodTradeCode` | Trade code (ticker) |
| `prodRegId` | CBIRC register code (登记编码) |
| `prodSer` | Product series name |
| `ipoBgnDt` | IPO start date (Unix ms) |
| `rskGrd` | Risk grade |
| `pfmCompBchmRmk` | Performance benchmark description |

### NAV History

```
POST /web/api/product/getNetValAndRate
Body: {"prodTradeCode": "<code>", "monthNum": "3"}
```

`monthNum` is required — without it the server returns an empty array. Valid values are `"1"`, `"3"`, `"6"`, `"12"` (months). Default in the browser is `"3"`.

Returns an array (may be empty if NAV not yet published). Ordered oldest-first.

| Field | Description |
|---|---|
| `navDate` | NAV date (Unix timestamp ms) |
| `nav` | Unit NAV (string) |
| `accuNav` | Accumulated NAV (string) |
| `tenThousandUnitIncome` | 万份收益 (null for net-value products) |
| `annualizedYield` | Annualized yield (null for net-value products) |

## Implementation Notes

These are non-obvious findings discovered during reverse engineering:

**SM2 public key** — hardcoded in `app.js` as five split string-table literals that are concatenated at runtime. The string table itself is rotated 477 times at startup using a push/shift IIFE with target checksum `0xa4d0b`. The key was recovered by simulating the rotation in Node.js and verifying against a known decoded value (`then` at index `0x3df`).

**Encryption format** — the JS `doEncrypt(payload, pubkey, mode=1)` returns C1(128 hex, no `04`) + C3(hash) + C2(ciphertext), then `app.js` prepends `'04'`. Final wire format: `04` + C1(64 bytes) + C3(32 bytes) + C2(plaintext-length bytes) = C1C3C2 mode. Use `gmssl.sm2.CryptSM2(mode=1)` and prepend `04` to its output.

**Required headers** — `User-Agent` and `Referer` are enforced by a WAF (omitting either returns 403). `Content-Type: application/json` is required at the application layer (omitting returns 500 with a garbled-body error). `tns` and `x-b3-businessid` are sent by the browser but not validated server-side.

**`tns` header** — generated per-request as `<Date.now()>,<random10digit>,<sha1(random10digit.toString())>`. Third part is SHA1 of the decimal string of the nonce, not of the timestamp.

**`monthNum` field** — `getNetValAndRate` silently returns an empty array if `monthNum` is omitted from the request body. Valid values are `"1"`, `"3"`, `"6"`, `"12"`. The browser defaults to `"3"`.

**`prodClcMode` path segment** — the page component initialises `prodClcMode = this.$route.query.prodClcMode || '01'`, so `01` is the hardcoded fallback, not a server-derived value. Omitting `?prodClcMode=` from the URL still results in `/getProductDetail/01` being called.

**`finType` URL parameter** — `P` (公募/public) or `I` (机构/institutional). It is a product-list filter and UI state only; it is never included in the encrypted request body for `getProductDetail` or `getNetValAndRate` and has no effect on those API calls.

## Example Usage

```
uv run china-wealth info cmb_wm 17977D
uv run china-wealth nav  cmb_wm 17977D
```
