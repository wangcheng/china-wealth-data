# chinawealth — 中国理财网 (China Wealth Register)

Source key: `chinawealth` | Issuers: Any CBIRC-registered issuer | Ticker: `<register_code>_<sub_share_code>`, e.g. `Z7007024000248_182481005A`

---

## Pages

### List / search page

URL: `https://xinxipilu.chinawealth.com.cn`

The main portal for CBIRC-registered wealth products. Search by product name, register code, or issuer.

### Detail page

URL: `https://xinxipilu.chinawealth.com.cn` (navigate from search results)

Displays product metadata, sub-share codes, and NAV history if the issuer publishes data here. Use `china-wealth lookup <register_code>` to find sub-share codes and confirm NAV availability before using this source.

---

## APIs

Base URL: `https://xinxipilu.chinawealth.com.cn/lcxp-platService`

All `POST` requests (except `getInitData`) must include a `signature` header computed from a per-session RSA private key.

### Session key — `POST /product/getInitData`

```
POST /product/getInitData
Body: {}
```

Must be called first to obtain a per-session RSA private key for signing subsequent requests.

| Property        | Value          |
| --------------- | -------------- |
| Login required  | No             |
| Encryption      | No             |
| Signing         | No (this call establishes signing) |
| Legacy TLS      | No             |

Returns the RSA-2048 private key (PKCS#8 PEM, with spaces instead of newlines in the base64 body) in `data`. Reuse this key for all subsequent calls in the same session.

### Product detail + NAV history — `POST /product/getProductDetail`

```
POST /product/getProductDetail
Body: {"prodRegCode": "<register_code>", "pageNum": 1, "pageSize": <n>}
signature: <base64(SHA256withRSA(JSON.stringify(body)))>
```

Returns product metadata and paginated NAV history.

| Property        | Value          |
| --------------- | -------------- |
| Login required  | No             |
| Encryption      | No             |
| Signing         | **Yes** — RSA-2048 SHA256withRSA/PKCS1v15 over compact JSON body; send as `signature` header |
| Legacy TLS      | No             |
| Pagination      | **Yes** — `pageNum` / `pageSize`. Use `pageSize: 1` for latest NAV only. |
| Search by code  | **Yes** — pass register code (`prodRegCode`) directly |

**Signing steps:**
1. Serialize body as compact JSON: `json.dumps(body, separators=(',', ':'))`.
2. Sign with SHA256withRSA (PKCS1v15) using the session private key from `getInitData`.
3. Base64-encode the signature and send as `signature` header.

**Response fields under `data`:**

| Path                                            | Description                                |
| ----------------------------------------------- | ------------------------------------------ |
| `prodBasicInfoVo.prodName`                      | Full product name                          |
| `prodBasicInfoVo.prodRegCode`                   | CBIRC register code                        |
| `prodBasicInfoVo.subShareCodeStr`               | Comma-separated sub-share codes            |
| `productTypeNetValueVo.defaultSubShareCode`     | Default sub-share code for NAV             |
| `productTypeNetValueVo.netValueVoList.list[]`   | NAV entries, newest-first                  |
| `netValueVoList.list[].subShareCode`            | Sub-share this entry belongs to            |
| `netValueVoList.list[].netValueDate`            | NAV date, format `YYYY-MM-DD`              |
| `netValueVoList.list[].shareNetVal`             | Unit NAV (份额净值)                        |
| `netValueVoList.list[].acumltNetVal`            | Cumulative NAV (份额累计净值)              |

See [examples/getProductDetail.json](examples/getProductDetail.json).

### NAV list — `POST /product/getNetValueList`

```
POST /product/getNetValueList
Body: {"subShareCode":"<code>","timeType":"1","prodRegCode":"<register_code>","pageNum":1,"pageSize":10}
signature: <...>
```

Returns paginated NAV history for a specific sub-share.

| Property        | Value          |
| --------------- | -------------- |
| Login required  | No             |
| Encryption      | No             |
| Signing         | **Yes** — same RSA scheme as above |
| Legacy TLS      | No             |
| Pagination      | **Yes** — `pageNum` / `pageSize` |
| Search by code  | **Yes** — `subShareCode` + `prodRegCode` |

See [examples/getNetValueList.json](examples/getNetValueList.json).

---

## Notes

- Not all issuers publish NAV data on 中国理财网. Use `china-wealth lookup <register_code>` to check before using this source.
- A product may have multiple sub-shares with different NAVs. Use `lookup` to list them.
- `JSON.stringify` produces compact JSON (no spaces) — use `json.dumps(body, separators=(',', ':'))` in Python.
- NAV dates use ISO format `YYYY-MM-DD`, unlike most other sources that use `YYYYMMDD`.
