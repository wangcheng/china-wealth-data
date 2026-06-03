# china-wealth-data

用于获取中国银行理财产品净值数据的 Python 库和命令行工具。

## 基本概念

理解以下概念有助于选择正确的数据源。

**发行机构（Issuer）** — 创建并管理理财产品的金融机构，如平安理财、信银理财、交银施罗德理财。一个机构下有多个产品。

**产品（Product）** — 在银保监会登记的具体理财产品，以登记编码标识（如 `Z7007024000248`）。一个产品属于一个发行机构，可能包含多个份额，各份额净值不同。

**份额（Share）** — 产品下的具体份额，有独立的份额代码和净值（如 `182481005A`）。份额是实际持有和交易的单位，本工具中的 ticker 始终对应一个份额。

**数据源（Source）** — 本工具获取净值数据的后端接口。数据源不等于发行机构——一个数据源可能覆盖多个发行机构的产品。

## 如何选择数据源

不同产品需要使用不同数据源：

- **`pingan_bank`** — 适用于所有在平安银行平台销售的产品，不限于平安理财自有产品。在[平安银行理财产品列表](https://b.pingan.com.cn/aum/m/inventory_search.html?dataType=07&sellingType=FINANCESUB)中找到产品，将 `prdCode` 作为 ticker 使用。该数据源潜在覆盖平安银行代销的多家机构产品。

- **`citic_wm`** — 适用于信银理财产品。在[信银理财产品列表](https://www.citic-wealth.com/wechat/product/#/productMarket)中找到产品，将 `fundCode` 作为 ticker 使用。

- **`ccb_wm`** — 适用于建信理财产品。在[建信理财产品列表](https://www.wealthccb.com/productList.html)中找到产品详情页，将 URL 中的数字页面 slug 作为 ticker 使用。

- **`chinawealth`** — 适用于上述数据源未覆盖的发行机构。中国理财网（xinxipilu.chinawealth.com.cn）是银保监会官方登记平台，理论上覆盖全国所有理财产品。但**并非所有机构都在此公布净值数据**，许多机构仅有基本产品信息而无价格。已知交银施罗德理财会在此更新净值。使用前建议先执行 `china-wealth lookup <登记编码>` 确认该产品是否有净值数据。

我们会持续新增各机构专属数据源。当专属数据源存在时，优先使用专属源而非 `chinawealth`，数据更稳定可靠。

## 支持的数据源

| 数据源 key    | 数据后端         | 覆盖机构示例                              | Ticker 格式                        | 历史净值             |
| ------------- | ---------------- | ----------------------------------------- | ---------------------------------- | -------------------- |
| `citic_wm`    | 信银理财 API     | 信银理财                                  | `AF233364A`                        | 支持                 |
| `pingan_bank` | 平安银行 API     | 平安理财及平安银行代销的其他机构产品        | `LHCZGS2100141A`                   | 支持（最近 20 条）   |
| `ccb_wm`      | 建信理财网页     | 建信理财                                  | 数字页面 slug（如 `9783965`）       | 不支持               |
| `chinawealth` | 中国理财网 API   | 所有登记机构，如交银施罗德理财             | `<登记编码>/<份额代码>`            | 支持（最近 10 条）   |

## 功能特性

- 通过数据源 + ticker 获取最新净值及产品元数据（名称、登记编码）
- 支持历史净值查询（部分数据源）
- 通过银保监会登记编码查询任意产品信息（via 中国理财网）
- 兼容 [bean-price](https://github.com/beancount/beanprice)，可用于 Beancount 记账工作流

## 安装

需要 [uv](https://docs.astral.sh/uv/)。

```bash
git clone https://github.com/yourname/china-wealth-data
cd china-wealth-data
uv sync
```

## 命令行使用

### `info` — 产品元数据和最新净值

```bash
uv run china-wealth info <数据源> <ticker>
```

```bash
uv run china-wealth info citic_wm AF233364A
uv run china-wealth info pingan_bank LHCZGS2100141A
uv run china-wealth info chinawealth Z7007024000248/182481005A
```

### `nav` — 历史净值

```bash
uv run china-wealth nav <数据源> <ticker>
```

```bash
uv run china-wealth nav citic_wm AF233364A
uv run china-wealth nav chinawealth Z7007024000248/182481005A
```

输出示例：

```
Date            Unit NAV    Accum. NAV  Currency
------------------------------------------------
2026-05-20      1.0373      1.0450      CNY
2026-05-21      1.0374      1.0451      CNY
...
```

### `lookup` — 通过登记编码查询产品

直接查询中国理财网。净值数据不保证存在——许多机构不在此发布净值。

```bash
uv run china-wealth lookup Z7007024000248
```

输出示例：

```
产品名称 Name:           施罗德交银理财得润固收添益日日开2号理财产品
登记编码 Register code:  Z7007024000248
发行机构 Issuer:         施罗德交银理财有限公司
起始日期 Start date:     2024/08/15
结束日期 End date:       2099/12/31

基本信息 Product details:
  运作模式 Operation mode     开放式净值型
  风险等级 Risk level         二级(中低)
  募集方式 Collection method  公募
  募集币种 Currency           人民币(CNY)
  投资性质 Asset type         固定收益类

业绩比较基准 Performance benchmark:
  1.46% – 2.51%

份额代码 Sub-share codes:  182481005A, 182481005B
  (ticker: Z7007024000248/<sub_share_code>)
```

## Python 库使用

```python
from china_wealth.sources import get_source

source = get_source("citic_wm")

# 最新净值
result = source.get_latest_price("AF233364A")
print(result.price)           # Decimal 净值
print(result.time)            # 带时区的 datetime
print(result.quote_currency)  # "CNY"

# 产品元数据
info = source.get_product_info("AF233364A")
print(info.name)           # 产品名称
print(info.register_code)  # 如 "Z7002623001159"
```

中国理财网数据源的 ticker 需包含份额代码：

```python
source = get_source("chinawealth")
result = source.get_latest_price("Z7007024000248/182481005A")
```

## bean-price 使用

在 Beancount commodity 中添加 `price:` 元数据，使用完整模块路径：

```beancount
2020-01-01 commodity CITIC_AF233364A
  price: "CNY:china_wealth.sources.citic_wm/AF233364A"

2020-01-01 commodity JTHS_BOCOM
  price: "CNY:china_wealth.sources.chinawealth/Z7007024000248/182481005A"
```

然后运行：

```bash
uv run bean-price your_file.beancount
```

## 项目结构

```
src/china_wealth/
├── __init__.py
├── types.py           # ProductInfo（产品级）和 ProductShareInfo（份额级）
├── source.py          # BaseSource 抽象类 + SourcePrice
├── chinawealth.py     # ChinaWealthClient（中国理财网 HTTP 客户端）
├── cli.py             # 命令行入口
└── sources/
    ├── __init__.py        # 注册表：get_source(source)
    ├── citic_wm.py        # 信银理财
    ├── pingan_bank.py     # 平安银行（平安理财及代销产品）
    ├── ccb_wm.py          # 建信理财（HTML 抓取）
    └── chinawealth.py     # 中国理财网（委托 ChinaWealthClient）
```

各数据源的 API 文档和响应示例见 [docs/](docs/)。

## License

MIT
