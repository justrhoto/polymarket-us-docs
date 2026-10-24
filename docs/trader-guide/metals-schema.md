> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Metals Schema

> Instrument fields for safely identifying gold and silver price markets

This page documents the strongly-typed fields on the instrument that identify a gold or silver price market (product codes `cpausp`, "Gold Spot Price Contracts", and `cpagsp`, "Silver Spot Price Contracts"). **Do not parse the instrument symbol or slug** — symbol formats are not part of the public contract and may change. Identify markets using the fields below.

Every gold and silver market settles on Chainlink's spot price data streams for XAU/USD and XAG/USD, not on a spot venue and not on an average. The Retail API exposes the same terms as the typed `assetPriceTerms` object; see [Asset Price Market Fields](https://docs.polymarket.us/api-reference/market/overview.md#asset-price-market-fields). The markets mirror the crypto Up/Down windows described in [Crypto Schema](https://docs.polymarket.us/trader-guide/crypto-schema.md). The differences are: the price source (Chainlink spot streams, category `FIN` and subcategory `COMMODITY` instead of `CRY`), a single spot value at each boundary instead of a 60-second average, trading opens at the window start instead of about 90 seconds before, `price_to_beat` arrives about a minute after the open instead of a few seconds, a daily `1d` window, trading hours with `metals_next_window_start`, and the `metals_*` field names.

> [!NOTE]
>
> Gold and silver Up/Down windows are listed in production from October 22, 2026, as announced in the [changelog](https://docs.polymarket.us/changelog.md).

## Section 1: Common Identifying Fields

The following fields appear on every gold and silver instrument. Together they identify the metal, the market type and the time window of a contract.

### Field Reference

| Field | Location | Type | Description |
| - | - | - | - |
| `event_category` | `metadata` | String | Always `FIN`. |
| `event_subcategory` | `metadata` | String | Always `COMMODITY`. |
| `instrument_product` | `metadata` | String | `cpausp` (gold) or `cpagsp` (silver). |
| `instrument_product_series` | `metadata` | String | `cpausp-gold` or `cpagsp-silver`. Use `event_series` for the cadence. |
| `clearing_sym` | `metadata` | String | `CPAUSP-COMMODITY` (gold) or `CPAGSP-COMMODITY` (silver). |
| `cftc_product_desc` | `metadata` | String | `Gold Spot Price Contracts` or `Silver Spot Price Contracts`. |
| `event_series` | `metadata` | String | Series slug encoding metal, family and cadence. See the series table below. |
| `event_id` | `metadata` | String | Slug of the event that holds one up/down window. No contract prefix. |
| `product_id` / `event_product_id` | `metadata` | String | `<instrument_product>-<event_id>`, e.g. `cpausp-gold-updown-15m-2026-10-22-1630z`. |
| `event_start_time` | `metadata` | Timestamp (UTC) | The window open. |
| `metals_asset_slug` | `metadata` | String | The metal: `gold` or `silver`. |
| `metals_price_symbol` | `metadata` | String | The symbol used by the Retail asset-price endpoints: `gold` (`commodity:gold`) or `silver` (`commodity:silver`). |
| `metals_market_type` | `metadata` | Enum | The market family. **Map on this field.** Today always `updown`. |
| `metals_horizon` | `metadata` | Enum | The window length: `15m`, `1h` or `1d`. See the enum below. |
| `outcome_strike` | `metadata` | String (numeric) | Always `"0.0"`. |
| `interval_start` | `metadata` | String (unix seconds) | Start of the window. |
| `interval_end` | `metadata` | String (unix seconds) | End of the window, i.e. the settlement instant. |
| `price_to_beat` | `metadata` | String (decimal) | The open value: the spot value at `interval_start`, with 2 decimals for gold and 3 for silver. Absent for about the first minute of the window; see Up/Down in Section 2. |
| `metals_settlement_price` | `metadata` | String (decimal) | The close value the window settled on, with the same decimals. Absent until resolution. Read the instrument state for completion, not this field. |
| `metals_next_window_start` | `metadata` | String (unix seconds) | Start of the next window of the same length that the trading hours allow. Equal to `interval_end` while the market stays open; later than `interval_end` when trading closes after this window. For a daily window it is the start of the next listed daily. Absent when no window fits in the search range. |

The instrument also carries display fields you can ignore for mapping: `market_title`, `market_subtitle`, `event_sort_type`, `event_tags`, `instrument_rules`, `event_image` and `event_image_display_type` (once the event has an image), and the CFTC reporting fields `cftc_instrument_id`, `cftc_binary_option_strike_price_alias`. Unlike crypto, gold and silver instruments carry no `market_sort_order`, `market_color` or `market_dark_color`. `cftc_product_desc` is in the table above because it names the product. Operational fields (`requires_manual_settlement`, `manual_settlement_*`, `expected_settlement_side`, `settlement_*`) can appear while the exchange is settling an instrument and must be ignored. Gold and silver instruments carry no `crypto_*` fields.

### `metals_market_type` Enum

| Value | Retail `assetPriceTerms.marketType` | Structure |
| - | - | - |
| `updown` | `ASSET_PRICE_MARKET_TYPE_UP_DOWN` | One binary instrument per window. Long side pays when the close is at or above the open. |

Treat an unknown value as a newer family: render the fields that are present and watch the [changelog](https://docs.polymarket.us/changelog.md).

### `metals_horizon` Enum

| Value | Meaning |
| - | - |
| `15m` | 15-minute window. |
| `1h` | 1-hour window on the hour. |
| `1d` | Daily window: from the 6:15 PM ET evening open to 5:00 PM ET the next day. |

### Series

`event_series` combines metal, family and cadence:

| Series | Family |
| - | - |
| `gold-updown-15m`, `gold-updown-1h`, `gold-updown-1d` | Gold Up/Down |
| `silver-updown-15m`, `silver-updown-1h`, `silver-updown-1d` | Silver Up/Down |

### Event Attributes

`event_attributes` records the contract for the exchange's DCM record: `strike_value: "Up"`, `strike_unit: "string"`, `strike_description: "Direction"`, `evaluation_type: "=="`, source agency `Chainlink` (`https://data.chain.link`). Each instrument resolves independently (`EVENT_OUTCOME_INDEPENDENT`). Settlement never depends on these fields; the `metals_*` metadata above and the rules text are authoritative.

***

## Section 2: Market Families

All windows share the same contract attributes as crypto Up/Down: tick size `0.01`, valid prices `0.01` to `0.99`, minimum order 0.01 contract, payout \$1.00 per contract, position accountability level 25,000 contracts, and a daily trade-day roll at 5:00 PM ET. Last trade is the settlement instant (`interval_end`); the instrument expires 30 minutes later, which leaves time for the exchange to resolve it. Source agency is Chainlink.

### Up/Down

*Will the price of gold (or silver) close the window at or above its open?*

| Aspect | Detail |
| - | - |
| Price source | Chainlink's spot price data streams: gold `XAU/USD-Streams-ForexPrice` ([data.chain.link](https://data.chain.link/streams/xau-usd-forexprice-streams), feed ID `0x0008991d4caf73e8e05f6671ef43cee5e8c5c3652a35fde0b0942e44a77b0e89`), silver `XAG/USD-Streams-ForexPrice` ([data.chain.link](https://data.chain.link/streams/xag-usd-forexprice-streams), feed ID `0x0008460f5d530196432a03eac80efb9537823f3db72db93cfefc3062988269a9`). |
| Open and close values | The spot value Chainlink publishes for the exact boundary second `T`, as written to Chainlink's DataStore. **This is a single spot value, not an average** — unlike crypto, there is no 60-second window. A window's close and the next window's open are the same value when they share a boundary. |
| Precision | Gold is rounded to the nearest cent (2 decimals), silver to three decimals, rounding half up. |
| Settlement | Long side (Yes) pays when the close value is greater than or equal to the open value. A flat window settles Up. Otherwise the short side (No) pays. |
| Cadence | `15m` windows are listed about 12 hours ahead and `1h` windows about 24 hours ahead. Each daily (`1d`) window is listed about 24 hours before it opens. Windows are listed only during the metals trading hours, Sunday 6:15 PM ET to Friday 5:00 PM ET, with no window from 5:00 PM to 6:15 PM ET and none on holidays; see [Gold and Silver FAQs](https://docs.polymarket.us/faqs/metals-faqs.md). 15-minute and 1-hour windows that overlap a scheduled exchange maintenance are not listed. Daily windows are listed as usual. |
| Lifecycle | Created `PENDING` and held `CLOSED` until the window starts; trading opens at the window start, not before. `price_to_beat` is stamped once Chainlink has published the opening value, usually about a minute after the open. Last trade at the window close. `metals_settlement_price` is stamped at resolution, usually about a minute after the close. A window whose price is missing is held, never settled on a fallback price; see [Gold and Silver FAQs](https://docs.polymarket.us/faqs/metals-faqs.md). |
| Structure | One instrument per event. `outcome_strike` is `"0.0"`; both `interval_start` and `interval_end` are set. |

The window trades without a `price_to_beat` for about its first minute. This is by design: the open value does not exist until Chainlink publishes it. Re-read the instrument after `interval_start` rather than assuming the value at listing.

***

## Section 3: Identifying Markets

Use this table to identify a market from instrument metadata. **Match on `metals_market_type`**, then read the window from `interval_start` / `interval_end`.

| To identify... | Fields |
| - | - |
| **Any gold or silver market** | `event_category = "FIN"` and `event_subcategory = "COMMODITY"`, with `metals_market_type` present |
| **Gold only** | `clearing_sym = "CPAUSP-COMMODITY"` (or `metals_asset_slug = "gold"`) |
| **Silver only** | `clearing_sym = "CPAGSP-COMMODITY"` (or `metals_asset_slug = "silver"`) |
| **15-minute window** | `metals_market_type = "updown"`, `metals_horizon = "15m"`; window = `interval_start` to `interval_end` |
| **Hourly window** | `metals_market_type = "updown"`, `metals_horizon = "1h"` |
| **Daily window** | `metals_market_type = "updown"`, `metals_horizon = "1d"` |
| **The open price of a window** | `price_to_beat` (absent until stamped, about a minute after `interval_start`) |
| **The value a window settled on** | `metals_settlement_price` (absent until resolution) |
| **When trading resumes after this window** | `metals_next_window_start` |

`event_category = "FIN"` and `event_subcategory = "COMMODITY"` can also match other commodity products. Use the clearing symbol or `metals_market_type` to select gold and silver.

### Worked Example: 15-Minute Gold Window

A settled 15-minute gold window that opened at 14:30 UTC on October 21, 2026:

```json theme={null}
{
  "symbol": "cpausp-gold-updown-15m-2026-10-21-1430z",
  "metadata": {
    "event_category": "FIN",
    "event_subcategory": "COMMODITY",
    "instrument_product": "cpausp",
    "instrument_product_series": "cpausp-gold",
    "clearing_sym": "CPAUSP-COMMODITY",
    "event_series": "gold-updown-15m",
    "event_id": "gold-updown-15m-2026-10-21-1430z",
    "product_id": "cpausp-gold-updown-15m-2026-10-21-1430z",
    "event_start_time": "2026-10-21 14:30:00+00",
    "metals_asset_slug": "gold",
    "metals_price_symbol": "gold",
    "metals_market_type": "updown",
    "metals_horizon": "15m",
    "outcome_strike": "0.0",
    "interval_start": "1792593000",
    "interval_end": "1792593900",
    "metals_next_window_start": "1792593900",
    "price_to_beat": "4133.50",
    "metals_settlement_price": "4128.62",
    "market_title": "Gold Up or Down 15m",
    "market_subtitle": "Oct 21, 10:30AM - 10:45AM"
  }
}
```

To interpret this contract:

1. `metals_market_type = "updown"` → an up/down window; `metals_horizon = "15m"` → 15 minutes long.
2. `interval_start` / `interval_end` → the window ran from 14:30:00 to 14:45:00 UTC (10:30 to 10:45 AM ET).
3. `price_to_beat = "4133.50"` → the gold spot value at 14:30:00; `metals_settlement_price = "4128.62"` → the value at 14:45:00.
4. Close \< open, so the short side (No, "Down") paid \$1.00.
5. `metals_next_window_start` equals `interval_end` → the next 15-minute window opened straight after this one.

### Worked Example: Daily Silver Window

A daily silver window has this shape (values from the window that opened at the 6:15 PM ET evening open on Tuesday, October 20, 2026, before it settled):

```json theme={null}
{
  "symbol": "cpagsp-silver-updown-1d-2026-10-20-2215z",
  "metadata": {
    "event_category": "FIN",
    "event_subcategory": "COMMODITY",
    "instrument_product": "cpagsp",
    "clearing_sym": "CPAGSP-COMMODITY",
    "event_series": "silver-updown-1d",
    "event_id": "silver-updown-1d-2026-10-20-2215z",
    "metals_asset_slug": "silver",
    "metals_price_symbol": "silver",
    "metals_market_type": "updown",
    "metals_horizon": "1d",
    "interval_start": "1792534500",
    "interval_end": "1792616400",
    "metals_next_window_start": "1792620900",
    "price_to_beat": "57.989",
    "market_title": "Silver Up or Down Daily"
  }
}
```

To interpret this contract:

1. `metals_horizon = "1d"` → a daily window.
2. `interval_start` / `interval_end` → 22:15 UTC on October 20 to 21:00 UTC on October 21 (6:15 PM to 5:00 PM ET), 22 hours 45 minutes.
3. `price_to_beat = "57.989"` → silver carries three decimals.
4. `metals_next_window_start = "1792620900"` → the next daily opens at 22:15 UTC on October 21 (6:15 PM ET), after the daily break.

***

## Best Practices

* **Never parse the symbol or slug** to determine the metal, market type or window. Symbol formats are not part of the public contract.
* **Map on `metals_market_type`.** Treat an unknown value as a newer family: render the terms that are present and watch the [changelog](https://docs.polymarket.us/changelog.md).
* **Read windows from `interval_start` and `interval_end`**, not from the instrument's expiration date, which is 30 minutes after settlement.
* **Treat every price as a decimal string** (`price_to_beat`, `metals_settlement_price`) and convert it yourself. Gold carries 2 decimals and silver 3; do not round silver to cents.
* **Expect `price_to_beat` about a minute after a window opens.** Re-read the instrument after `interval_start`.
* **Use `metals_next_window_start` for closed periods.** It tells you when the next window opens after the daily break, the weekend or a holiday.
* **Read fresh prices from the Retail API.** `POST /v1/refdata/instruments` serves a cached copy of each instrument, so `price_to_beat` and `metals_settlement_price` can appear there up to an hour after they are stamped. The Retail market endpoints (`assetPriceTerms.priceToBeat` and `assetPriceTerms.settlementPrice`) update when the value is stamped, and `GET /v1/instruments/{symbol}/settlement` reads the final settlement from the exchange live. See [Settlement API](https://docs.polymarket.us/institutional/settlement/overview.md).
* **Follow each market's own rules text** (`instrument_rules`). It names the stream, the two instants and the rounding.


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.