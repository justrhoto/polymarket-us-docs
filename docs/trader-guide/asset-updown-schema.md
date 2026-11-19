> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Asset Up/Down Schema

> Instrument fields for safely identifying WTI and natural gas Up/Down markets, and every Up/Down market on the asset_* keys

This page documents the strongly-typed fields on the instrument that identify an Up/Down market on the `asset_*` metadata keys. Today these are the WTI crude oil and natural gas markets: product codes `cpwtif` ("WTI Crude Oil Futures Price Contracts") and `cpngf` ("Natural Gas Futures Price Contracts"). **Do not parse the instrument symbol or slug** — symbol formats are not part of the public contract and may change. Identify markets using the fields below.

The `asset_*` keys are the standard for new Up/Down markets on assets other than crypto. Gold and silver keep the `metals_*` keys they launched with (see [Metals Schema](https://docs.polymarket.us/trader-guide/metals-schema.md)), and crypto keeps the `crypto_*` keys (see [Crypto Schema](https://docs.polymarket.us/trader-guide/crypto-schema.md)). An instrument carries one key set only.

Every WTI and natural gas window settles on a Chainlink futures mid price data stream: the mid price that Chainlink calculates from the bid and ask quotes for the front-month futures contract. It is not a traded price or an exchange settlement price. Only prices published while the stream marks the market as open count. The Retail API exposes the same terms as the typed `assetPriceTerms` object; see [Asset Price Market Fields](https://docs.polymarket.us/api-reference/market/overview.md#asset-price-market-fields).

The windows work like the gold and silver windows in [Metals Schema](https://docs.polymarket.us/trader-guide/metals-schema.md): the same weekly trading hours, a single value at each boundary, trading from the window start and a price to beat about a minute later. The differences are:

* The field names: `asset_*` in place of `metals_*`.
* Three keys that only `asset_*` windows carry: `asset_class`, `asset_price_decimals` and `asset_contract_month`.
* Each window states its decimals in `asset_price_decimals`: 2 for WTI, 4 for natural gas. A window keeps the decimals it was listed with.
* The price follows a futures contract that rolls to the next month. `asset_contract_month` names the contract.
* The holidays and early closes follow CME Globex, not the metals calendar.

> [!NOTE]
>
> WTI and natural gas Up/Down windows are listed in production from November 18, 2026, as announced in the [changelog](https://docs.polymarket.us/changelog.md). For the rules, trading hours and holiday calendar, see [Oil and Gas FAQs](https://docs.polymarket.us/faqs/oil-gas-faqs.md).

## Section 1: Common Identifying Fields

The following fields appear on every `asset_*` Up/Down instrument. Together they identify the asset, the market type and the time window of a contract.

### Field Reference

| Field | Location | Type | Description |
| - | - | - | - |
| `event_category` | `metadata` | String | `FIN` for WTI and natural gas. |
| `event_subcategory` | `metadata` | String | `COMMODITY` for WTI and natural gas. |
| `instrument_product` | `metadata` | String | `cpwtif` (WTI) or `cpngf` (natural gas). |
| `instrument_product_series` | `metadata` | String | `cpwtif-wti` or `cpngf-natgas`. Use `event_series` for the cadence. |
| `clearing_sym` | `metadata` | String | `CPWTIF-COMMODITY` (WTI) or `CPNGF-COMMODITY` (natural gas). |
| `cftc_product_desc` | `metadata` | String | `WTI Crude Oil Futures Price Contracts` or `Natural Gas Futures Price Contracts`. |
| `event_series` | `metadata` | String | Series slug encoding asset, family and cadence. See the series table below. |
| `event_id` | `metadata` | String | Slug of the event that holds one up/down window. No contract prefix. |
| `product_id` / `event_product_id` | `metadata` | String | `<instrument_product>-<event_id>`, e.g. `cpngf-natgas-updown-15m-2026-11-15-2315z`. |
| `event_start_time` | `metadata` | Timestamp (UTC) | The window open. |
| `asset_market_type` | `metadata` | Enum | The market family. **Map on this field.** Today always `updown`. |
| `asset_class` | `metadata` | Enum | The asset class. `commodity` for WTI and natural gas. Always present on an `asset_*` instrument. See the enum below. |
| `asset_slug` | `metadata` | String | The asset: `wti` or `natgas`. |
| `asset_price_symbol` | `metadata` | String | The symbol used by the Retail asset-price endpoints: `wti` (`commodity:wti`) or `natgas` (`commodity:natgas`). |
| `asset_horizon` | `metadata` | Enum | The window length: `15m`, `1h` or `1d`. See the enum below. |
| `asset_price_decimals` | `metadata` | String (integer) | The decimal places every price of this window carries: the open, the close and the rules text. `2` for WTI, `4` for natural gas, on every window length. **Read it on each window.** A listed window keeps its value if the decimals of new windows change later. |
| `outcome_strike` | `metadata` | String (numeric) | Always `"0.0"`. |
| `interval_start` | `metadata` | String (unix seconds) | Start of the window. |
| `interval_end` | `metadata` | String (unix seconds) | End of the window, i.e. the settlement instant. |
| `price_to_beat` | `metadata` | String (decimal) | The open value: the stream's mid price at `interval_start`, with `asset_price_decimals` places. Absent for about the first minute of the window; see Up/Down in Section 2. |
| `pending_price_to_beat` | `metadata` | String (decimal) | Display only. A pending open value that can appear before `price_to_beat`. Can be absent. Settlement never reads it; see [Pending Price to Beat](#pending-price-to-beat). |
| `asset_contract_month` | `metadata` | String (`YYYY-MM`) | The delivery month of the futures contract the window's prices come from, e.g. `2026-12`. Written together with `price_to_beat`, never at listing. Absent when the exchange could not read the month. |
| `asset_settlement_price` | `metadata` | String (decimal) | The close value the window settled on, with the same decimals. Absent until resolution. Read the instrument state for completion, not this field. |
| `asset_next_window_start` | `metadata` | String (unix seconds) | Start of the next window of the same length that the trading hours allow. Equal to `interval_end` while the market stays open; later than `interval_end` when trading closes after this window. For a daily window it is the start of the next listed daily. Absent when no window fits in the search range. |

The instrument also carries display fields you can ignore for mapping: `market_title`, `market_subtitle`, `asset_display_name`, `event_sort_type`, `event_tags`, `instrument_rules`, `event_image` and `event_image_display_type` (once the asset has an image), and the CFTC reporting fields `cftc_instrument_id`, `cftc_binary_option_strike_price_alias`. Unlike crypto, `asset_*` instruments carry no `market_sort_order`, `market_color` or `market_dark_color`. `cftc_product_desc` is in the table above because it names the product. Operational fields (`requires_manual_settlement`, `manual_settlement_*`, `expected_settlement_side`, `settlement_*`) can appear while the exchange is settling an instrument and must be ignored. `asset_*` instruments carry no `crypto_*` and no `metals_*` fields.

### `asset_market_type` Enum

| Value | Retail `assetPriceTerms.marketType` | Structure |
| - | - | - |
| `updown` | `ASSET_PRICE_MARKET_TYPE_UP_DOWN` | One binary instrument per window. Long side pays when the close is at or above the open. |

Treat an unknown value as a newer family: render the fields that are present and watch the [changelog](https://docs.polymarket.us/changelog.md).

### `asset_class` Enum

| Value | Retail `assetPriceTerms.asset.assetClass` | Assets |
| - | - | - |
| `commodity` | `ASSET_CLASS_COMMODITY` | WTI, natural gas |

Treat an unknown value as a newer class: the asset slug and the prices are still valid.

### `asset_horizon` Enum

| Value | Meaning |
| - | - |
| `15m` | 15-minute window. |
| `1h` | 1-hour window on the hour. |
| `1d` | Daily window: from the 6:15 PM ET evening open to 5:00 PM ET the next day. |

### Series

`event_series` combines asset, family and cadence:

| Series | Family | Series title |
| - | - | - |
| `wti-updown-15m`, `wti-updown-1h`, `wti-updown-1d` | WTI Up/Down | WTI Crude Up or Down (15m), (Hourly), (Daily) |
| `natgas-updown-15m`, `natgas-updown-1h`, `natgas-updown-1d` | Natural gas Up/Down | Natural Gas Up or Down (15m), (Hourly), (Daily) |

Each window's `market_title` names the cadence without parentheses, e.g. `WTI Crude Up or Down 15m`, `WTI Crude Up or Down Hourly` or `Natural Gas Up or Down Daily`.

### Event Attributes

`event_attributes` records the contract for the exchange's DCM record: `strike_value: "Up"`, `strike_unit: "string"`, `strike_description: "Direction"`, `evaluation_type: "=="`, source agency `Chainlink` (`https://data.chain.link`). Each instrument resolves independently (`EVENT_OUTCOME_INDEPENDENT`). Settlement never depends on these fields; the `asset_*` metadata above and the rules text are authoritative.

***

## Section 2: Market Families

All windows share the same contract attributes as the gold, silver and crypto Up/Down windows: tick size `0.01`, valid prices `0.01` to `0.99`, minimum order 0.01 contract, payout \$1.00 per contract, position accountability level 25,000 contracts, and a daily trade-day roll at 5:00 PM ET. Last trade is the settlement instant (`interval_end`); the instrument expires 30 minutes later, which leaves time for the exchange to resolve it. Source agency is Chainlink.

### Up/Down

*Will the price of WTI crude oil futures (natural gas futures) close the window at or above its open?*

| Aspect | Detail |
| - | - |
| Price source | Chainlink's futures mid price data streams on market hours: WTI `NY-USOIL/USD-Streams-FuturesPrice` ("US Oil", feed ID `0x000e1d107999554713afbcea008e89815bdcc2027ca8433ed04be316fd446668`) and natural gas `NatGas/USD-Streams-FuturesPrice` ("Natural Gas", feed ID `0x000e74d63a589ecd8de6a90eda318ee230c1868941bd2249b50699da3301b479`). Each stream tracks the front-month contract of a CME futures product: NYMEX WTI crude oil (CL) and NYMEX Henry Hub natural gas (NG). Only prices published while the stream marks the market as open count. |
| Open and close values | The mid price Chainlink writes to its DataStore for the exact boundary second `T`. Chainlink calculates it from the bid and ask quotes for the front-month contract. **This is a single value, not an average**, and not a traded or exchange settlement price. A window's close and the next window's open are the same value when they share a boundary. |
| Precision | `asset_price_decimals` on the window. The exchange rounds the published mid price half up, never truncates it. WTI: the nearest cent (2 decimals), so 0.005 rounds up to 0.01 and 81.235 becomes 81.24. Natural gas: 4 decimals, so 0.00005 rounds up to 0.0001. The decimals are the same on every window length. A window listed before a change of decimals keeps its own `asset_price_decimals`. |
| Settlement | Long side (Yes) pays when the close value is greater than or equal to the open value. A flat window settles Up. Otherwise the short side (No) pays. |
| Contract rolls | Chainlink determines which contract month each stream follows and when it moves to the next one. The published price is used without adjusting for that change. So far Chainlink has switched each stream at 6:00 PM ET on the evening before the expiring contract's last trading day, at the reopen after the daily break, so no window has spanned a roll. The first window after a roll can open far from the last close before it, because the prices belong to different contracts. `asset_contract_month` names the contract of each window. If a window's close is on a different contract from its open, the exchange settles that window manually. |
| Cadence | `15m` windows are listed about 12 hours ahead and `1h` windows about 24 hours ahead. Each daily (`1d`) window is listed about 24 hours before it opens. Windows are listed only during the CME Globex trading hours, Sunday 6:15 PM ET to Friday 5:00 PM ET, with no window from 5:00 PM to 6:15 PM ET, none on full-close holidays and shorter sessions on early-close days; see [Oil and Gas FAQs](https://docs.polymarket.us/faqs/oil-gas-faqs.md). 15-minute and 1-hour windows that overlap a scheduled exchange maintenance are not listed. Daily windows are listed as usual. |
| Lifecycle | Created `PENDING` and held `CLOSED` until the window starts; trading opens at the window start, not before. `pending_price_to_beat` can appear about 1 to 2 seconds after the open. `price_to_beat` and `asset_contract_month` are stamped once Chainlink has written the opening value to its DataStore, usually about a minute after the open. Last trade at the window close. `asset_settlement_price` is stamped at resolution, usually about a minute after the close. A window whose price is missing is held, never settled on a fallback price; see [Oil and Gas FAQs](https://docs.polymarket.us/faqs/oil-gas-faqs.md). |
| Structure | One instrument per event. `outcome_strike` is `"0.0"`; both `interval_start` and `interval_end` are set. |

The window trades without a `price_to_beat` for about its first minute. This is by design: the open value does not exist on the DataStore until Chainlink writes it. Re-read the instrument after `interval_start` rather than assuming the value at listing.

### Pending Price to Beat

A window can carry `pending_price_to_beat` before `price_to_beat` arrives. It is Chainlink's report for exactly `interval_start` as the exchange received it, rounded to the window's `asset_price_decimals`. It is for display only:

* It is written at most once, usually 1 to 2 seconds after the window starts, and only while `price_to_beat` is absent. It is never changed or removed, so it stays on the instrument next to `price_to_beat`.
* It can be absent, for example when Chainlink has no report for exactly the window start.
* In rare cases it can differ from `price_to_beat`. The window settles only on `price_to_beat`, the DataStore value.
* Show `price_to_beat` when it is present, else `pending_price_to_beat` labelled as pending.
* The key has no relation to the `PENDING` instrument state.

The Retail API shows it as `assetPriceTerms.pendingPriceToBeat`. That field is `null` again once `priceToBeat` is set, and `null` on assets where a pending price is not shown.

***

## Section 3: Identifying Markets

Use this table to identify a market from instrument metadata. **Match on `asset_market_type`**, then read the asset from `asset_slug` and the window from `interval_start` / `interval_end`.

| To identify... | Fields |
| - | - |
| **Any `asset_*` Up/Down market** | `asset_market_type` present |
| **Any WTI or natural gas market** | `asset_slug` is `"wti"` or `"natgas"` (or `clearing_sym` is `"CPWTIF-COMMODITY"` or `"CPNGF-COMMODITY"`), with `asset_market_type` present |
| **WTI only** | `clearing_sym = "CPWTIF-COMMODITY"` (or `asset_slug = "wti"`) |
| **Natural gas only** | `clearing_sym = "CPNGF-COMMODITY"` (or `asset_slug = "natgas"`) |
| **15-minute window** | `asset_market_type = "updown"`, `asset_horizon = "15m"`; window = `interval_start` to `interval_end` |
| **Hourly window** | `asset_market_type = "updown"`, `asset_horizon = "1h"` |
| **Daily window** | `asset_market_type = "updown"`, `asset_horizon = "1d"` |
| **The decimals of a window's prices** | `asset_price_decimals` |
| **The open price of a window** | `price_to_beat` (absent until stamped, about a minute after `interval_start`) |
| **A pending open price, for display only** | `pending_price_to_beat` (can be absent) |
| **The futures contract of a window** | `asset_contract_month` (absent until `price_to_beat` is stamped) |
| **The value a window settled on** | `asset_settlement_price` (absent until resolution) |
| **When trading resumes after this window** | `asset_next_window_start` |

`event_category = "FIN"` and `event_subcategory = "COMMODITY"` also match gold, silver and other commodity products, and every `asset_*` market carries `asset_market_type`. Select WTI and natural gas by `asset_slug` or the clearing symbol.

### Worked Example: 15-Minute Natural Gas Window

A settled 15-minute natural gas window that opened at 23:15 UTC on November 15, 2026 (preprod values):

```json theme={null}
{
  "symbol": "cpngf-natgas-updown-15m-2026-11-15-2315z",
  "metadata": {
    "event_category": "FIN",
    "event_subcategory": "COMMODITY",
    "instrument_product": "cpngf",
    "instrument_product_series": "cpngf-natgas",
    "clearing_sym": "CPNGF-COMMODITY",
    "cftc_product_desc": "Natural Gas Futures Price Contracts",
    "event_series": "natgas-updown-15m",
    "event_id": "natgas-updown-15m-2026-11-15-2315z",
    "product_id": "cpngf-natgas-updown-15m-2026-11-15-2315z",
    "event_start_time": "2026-11-15 23:15:00+00",
    "asset_market_type": "updown",
    "asset_class": "commodity",
    "asset_slug": "natgas",
    "asset_price_symbol": "natgas",
    "asset_display_name": "Natural Gas",
    "asset_horizon": "15m",
    "asset_price_decimals": "4",
    "outcome_strike": "0.0",
    "interval_start": "1794784500",
    "interval_end": "1794785400",
    "asset_next_window_start": "1794785400",
    "price_to_beat": "3.1595",
    "asset_contract_month": "2026-12",
    "asset_settlement_price": "3.1624",
    "market_title": "Natural Gas Up or Down 15m",
    "market_subtitle": "Nov 15, 6:15PM - 6:30PM"
  }
}
```

To interpret this contract:

1. `asset_market_type = "updown"` → an up/down window; `asset_horizon = "15m"` → 15 minutes long.
2. `interval_start` / `interval_end` → the window ran from 23:15:00 to 23:30:00 UTC (6:15 to 6:30 PM ET on Sunday), the first 15-minute window after the weekend.
3. `asset_price_decimals = "4"` → every price of this window carries four decimals.
4. `price_to_beat = "3.1595"` → the natural gas mid price at 23:15:00, on the December 2026 contract (`asset_contract_month`); `asset_settlement_price = "3.1624"` → the mid price at 23:30:00.
5. Close ≥ open, so the long side (Yes, "Up") paid \$1.00.
6. `asset_next_window_start` equals `interval_end` → the next 15-minute window opened straight after this one.

### Worked Example: Daily WTI Window

A daily WTI window has this shape (preprod values from the window that opened at the 6:15 PM ET evening open on Sunday, November 15, 2026, before it settled):

```json theme={null}
{
  "symbol": "cpwtif-wti-updown-1d-2026-11-15-2315z",
  "metadata": {
    "event_category": "FIN",
    "event_subcategory": "COMMODITY",
    "instrument_product": "cpwtif",
    "clearing_sym": "CPWTIF-COMMODITY",
    "event_series": "wti-updown-1d",
    "event_id": "wti-updown-1d-2026-11-15-2315z",
    "asset_market_type": "updown",
    "asset_class": "commodity",
    "asset_slug": "wti",
    "asset_price_symbol": "wti",
    "asset_horizon": "1d",
    "asset_price_decimals": "2",
    "interval_start": "1794784500",
    "interval_end": "1794866400",
    "asset_next_window_start": "1794870900",
    "price_to_beat": "88.25",
    "asset_contract_month": "2026-12",
    "market_title": "WTI Crude Up or Down Daily",
    "market_subtitle": "Nov 15, 6:15PM - Nov 16, 5:00PM"
  }
}
```

To interpret this contract:

1. `asset_horizon = "1d"` → a daily window.
2. `interval_start` / `interval_end` → 23:15 UTC on November 15 to 22:00 UTC on November 16 (6:15 PM to 5:00 PM ET), 22 hours 45 minutes.
3. `asset_price_decimals = "2"` and `price_to_beat = "88.25"` → WTI carries two decimals.
4. `asset_contract_month = "2026-12"` → the window opened on the December 2026 contract and settles on the same contract.
5. `asset_next_window_start = "1794870900"` → the next daily opens at 23:15 UTC on November 16 (6:15 PM ET), after the daily break.

***

## Best Practices

* **Never parse the symbol or slug** to determine the asset, market type or window. Symbol formats are not part of the public contract.
* **Map on `asset_market_type` and `asset_class`.** Treat an unknown value as newer: render the terms that are present and watch the [changelog](https://docs.polymarket.us/changelog.md).
* **Read windows from `interval_start` and `interval_end`**, not from the instrument's expiration date, which is 30 minutes after settlement.
* **Read the decimals from `asset_price_decimals` on each window.** Show and compare every price of the window at exactly that many places. Do not assume one value per asset: a window keeps the decimals it was listed with.
* **Treat every price as a decimal string** (`price_to_beat`, `pending_price_to_beat`, `asset_settlement_price`) and convert it yourself.
* **Expect `price_to_beat` about a minute after a window opens.** Re-read the instrument after `interval_start`.
* **Use `pending_price_to_beat` for display only.** Show it, labelled as pending, only while `price_to_beat` is absent. Never settle or reconcile a window on it.
* **Use `asset_contract_month` across contract rolls.** A step between the last window before a roll and the first window after it is a change of contract, not a price move.
* **Use `asset_next_window_start` for closed periods.** It tells you when the next window opens after the daily break, the weekend or a holiday.
* **Read fresh prices from the Retail API.** `POST /v1/refdata/instruments` serves a cached copy of each instrument, so `price_to_beat`, `pending_price_to_beat`, `asset_contract_month` and `asset_settlement_price` can appear there up to an hour after they are stamped. The Retail market endpoints (`assetPriceTerms.priceToBeat`, `assetPriceTerms.contractMonth` and `assetPriceTerms.settlementPrice`) update when the value is stamped, and `GET /v1/instruments/{symbol}/settlement` reads the final settlement from the exchange live. See [Settlement API](https://docs.polymarket.us/institutional/settlement/overview.md).
* **Follow each market's own rules text** (`instrument_rules`). It names the stream, the two instants and the rounding, says that only prices published while the stream marks the market as open count, leaves the contract roll to Chainlink, and links the full product terms.


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.