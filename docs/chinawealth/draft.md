request is signed

```shell
curl 'https://xinxipilu.chinawealth.com.cn/lcxp-platService/product/getProductDetail' \
  -H 'Accept: application/json, text/plain, */*' \
  -H 'Accept-Language: en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7' \
  -H 'Connection: keep-alive' \
  -H 'Content-Type: application/json;charset=UTF-8' \
  -b 'JSESSIONID=77399FB14E45609E9D2B6700C8BD5860; size=small' \
  -H 'Origin: https://xinxipilu.chinawealth.com.cn' \
  -H 'Sec-Fetch-Dest: empty' \
  -H 'Sec-Fetch-Mode: cors' \
  -H 'Sec-Fetch-Site: same-origin' \
  -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36' \
  -H 'sec-ch-ua: "Chromium";v="148", "Google Chrome";v="148", "Not/A)Brand";v="99"' \
  -H 'sec-ch-ua-mobile: ?0' \
  -H 'sec-ch-ua-platform: "macOS"' \
  -H 'signature: S/xjSrC2k1MP1RON2svGAt/N0mr9narQN9iqJ1R4CczZ2Vj7CL+ONNL/9bhDLCnMrNncbO//AHIndvsIusnzU4oSFQTPYQCpZpQhfpzpFy5gNJE5inPkUO6amztZxUHOcwM0V3RkTUQZGIuL1fLcVfcbyTYX+K92c09F568vhC0XeTEz637N8EIeHSMq4fszfLZaWeZA17dU2lQiOOSQLlCpaH6N3/AaDfmrAj1MDlL8P/nABCP2Tqly8/452+VMpOQwLDlNEddEfT1PHxDGOS1eL0bTiA7Qq6KdRF2VVfzQsAIoQaMPVNN1UTwU9thorXT0RZ4fqIctdzfKcHnirg==' \
  --data-raw '{"prodRegCode":"Z7007024000248","pageNum":1,"pageSize":1}'
```

```
curl --request POST \
  --url https://xinxipilu.chinawealth.com.cn/lcxp-platService/product/getInitData \
  --header 'content-type: application/json' \
  --data '{}'
```
