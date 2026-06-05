# cmb_wm — 招银理财 (CMB Wealth Management)

Source key: `cmb_wm` | Issuers: 招银理财 | Ticker: `prodTradeCode`, e.g. `17977D`

---

## Pages

### List page

URL: `https://www.cmbchinawm.com/publicOffering`

Lists publicly offered products from 招银理财. Each product shows its `prodTradeCode`.

### Detail page

URL: `https://www.cmbchinawm.com/proDetail?prodTradeCode=<prodTradeCode>&prodClcMode=01&finType=P`

Example: `https://www.cmbchinawm.com/proDetail?prodTradeCode=109405A&prodClcMode=01&finType=P`

The `prodTradeCode` in the URL is the ticker. The CBIRC register code (登记编码) is returned by the detail API as `prodRegId`.

---

## APIs

Base URL: `https://www.cmbchinawm.com/prod-api`

All endpoints use `POST`. The request body must be SM2-encrypted (see Encryption below).

### Product detail — `POST /web/api/product/getProductDetail/<prodClcMode>`

```
POST /web/api/product/getProductDetail/01
Content-Type: application/json
Body: <SM2-encrypted hex of {"prodTradeCode": "<code>"}>
```

| Property        | Value          |
| --------------- | -------------- |
| Login required  | No             |
| Encryption      | **Yes** — SM2 asymmetric, C1C3C2 mode (see Encryption below) |
| Signing         | No             |
| Legacy TLS      | No             |
| Pagination      | N/A (single product) |
| Required headers | `User-Agent` (browser UA), `Referer: https://www.cmbchinawm.com/`, `Content-Type: application/json` |

**Response `data` fields:**

| Field             | Description                          |
| ----------------- | ------------------------------------ |
| `csName`          | Product name                         |
| `prodTradeCode`   | Trade code (ticker)                  |
| `prodRegId`       | CBIRC register code (登记编码)       |
| `prodSer`         | Product series name                  |
| `rskGrd`          | Risk grade                           |

See [examples/getDetail.json](examples/getDetail.json).

### NAV history — `POST /web/api/product/getNetValAndRate`

```
POST /web/api/product/getNetValAndRate
Content-Type: application/json
Body: <SM2-encrypted hex of {"prodTradeCode": "<code>", "monthNum": "3"}>
```

| Property        | Value          |
| --------------- | -------------- |
| Login required  | No             |
| Encryption      | **Yes** — SM2 (same as above) |
| Signing         | No             |
| Legacy TLS      | No             |
| Pagination      | **Partial** — `monthNum` selects time window (`"1"`, `"3"`, `"6"`, `"12"` months); no page-based pagination. Full history beyond 12 months is not accessible via this API. |
| Search by code  | N/A (takes a single `prodTradeCode`) |

`monthNum` is **required** — omitting it causes the server to return an empty array.

**Response array entries:**

| Field       | Description                        |
| ----------- | ---------------------------------- |
| `navDate`   | NAV date (Unix timestamp ms)       |
| `nav`       | Unit NAV (string)                  |
| `accuNav`   | Accumulated NAV (string)           |

Results are ordered oldest-first.

See [examples/getNetValAndRate.json](examples/getNetValAndRate.json).

---

## Encryption

All request bodies are SM2-encrypted JSON, hex-encoded, in **C1C3C2 format** (GB/T 32918.4 mode 1).

**SM2 public key** (uncompressed, without `04` prefix — concatenate these two hex strings):

```
cf98844d3ddf6b87e124fba422e64e0b93e9bf83aff6fb8e246c0582567390099
bfcb6563290e9a015f42a382053ceb3c95530201da6c8f1ba140774f3bc6a87
```

**Encryption steps:**
1. JSON-serialize the plaintext payload.
2. Encrypt with `gmssl.sm2.CryptSM2(mode=1)`.
3. Prepend `04` to the output (wire format: `04` + C1(64 bytes) + C3(32 bytes) + C2(variable)).
4. Hex-encode the result and send as the raw request body.

**Key source:** The public key is assembled from five split string-table literals in `app.js`, concatenated after the string table is rotated 477 times.

---

## Notes

- `User-Agent` and `Referer` are enforced by a WAF — omitting either returns HTTP 403.
- `Content-Type: application/json` is required at the application layer — omitting returns HTTP 500.
- `tns` header (`<timestamp>,<random10digit>,<sha1(random10digit)>`) is sent by browsers but not validated server-side.
- `prodClcMode` defaults to `01` in the browser; using `01` universally works for all products.
- `finType=P` in the detail page URL is a UI filter only; it has no effect on API calls.
