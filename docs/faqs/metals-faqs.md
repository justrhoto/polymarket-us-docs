> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Gold and Silver FAQs

> Frequently asked questions about trading Gold and Silver Spot Price Contracts on Polymarket US

## General Rules

### What kinds of gold and silver contracts are offered?

Polymarket US offers Event Contracts that settle on the spot price of gold and silver: "Gold Spot Price Contracts" (product `CPAUSP`) and "Silver Spot Price Contracts" (product `CPAGSP`). One automated market family is listed on a recurring schedule:

| Family | Question | Cadence |
| - | - | - |
| Up/Down | Will the gold (silver) price close the window at or above its open? | 15-minute, 1-hour and daily windows during the metals trading hours |

There are no 5-minute windows, and no Above/Below, Price Range or One-Touch markets on gold or silver yet.

> [!NOTE]
>
> Gold and silver Up/Down windows are listed in production from October 22, 2026, as announced in the [changelog](https://docs.polymarket.us/changelog.md). For the fields that identify each market, see [Metals Schema](https://docs.polymarket.us/trader-guide/metals-schema.md).

### How are gold and silver contracts settled?

Every window settles on Chainlink's spot price data streams: [XAU/USD](https://data.chain.link/streams/xau-usd-forexprice-streams) (`XAU/USD-Streams-ForexPrice`) for gold and [XAG/USD](https://data.chain.link/streams/xag-usd-forexprice-streams) (`XAG/USD-Streams-ForexPrice`) for silver. Prices on other venues have no effect on settlement.

The open value is the spot value Chainlink publishes for the window's start time, and the close value is the spot value it publishes for the window's end time. Unlike the crypto markets, these are **single spot values, not 60-second averages**. Gold prices are rounded to the nearest cent (2 decimals) and silver prices to three decimal places, rounding half up.

### How do ties work?

A window whose close value equals its open value, after rounding, settles **Up**.

### When does settlement occur?

A window settles once Chainlink has published the closing value, usually about a minute after the window ends. The instrument's expiration is set 30 minutes after the end time to leave time for resolution. Trading ends at the end time regardless.

### Can a market settle early?

No. Every window settles at its stated end time.

### What happens if a price is missing?

A window settles only on the value Chainlink publishes for its exact start and end times. It never settles on a neighbouring second, a last known price or any other fallback.

* If the closing value has not been published, the window is held and does not settle.
* If the opening value has not been published, the window trades without a price to beat until it is. If it arrives in the last 15 seconds of the window or later, the window never shows a price to beat, but it still settles on the published open value.
* If a value is still missing 60 minutes after the window ends, the exchange settles the window manually.

### Do gold and silver contracts trade around the clock?

No. They follow the metals market, from Sunday 6:15 PM ET to Friday 5:00 PM ET:

* Nothing is listed from Friday 5:00 PM ET to Sunday 6:15 PM ET.
* No window runs from 5:00 PM to 6:15 PM ET on any day.
* No window starts at the 6:00 PM ET reopen, because Chainlink publishes no spot value at 6:00 PM. The first 15-minute window of each evening starts at 6:15 PM ET and the first 1-hour window at 7:00 PM ET.
* A window is listed only if it lies wholly inside the trading hours.

The exchange's trade-day roll at 5:00 PM ET applies as on every other market.

### What happens on holidays?

A holiday removes the session that closes on that date: no window runs from 6:15 PM ET the evening before the holiday to 5:00 PM ET on the holiday. The 6:15 PM ET session on the holiday itself still lists, because it belongs to the next trading day. A Monday holiday therefore also removes the Sunday-evening session and that Sunday's daily window.

Holiday closures scheduled today. This is the exchange's listing calendar for gold and silver. It can differ from Chainlink's [market hours](https://docs.chain.link/data-streams/market-hours), which can still publish prices on a date when no window is listed:

| Date | Holiday |
| - | - |
| November 11, 2026 | Veterans' Day |
| November 26, 2026 | Thanksgiving |
| December 25, 2026 | Christmas Day |
| January 1, 2027 | New Year's Day |
| January 18, 2027 | Martin Luther King Day |
| February 15, 2027 | Presidents' Day |
| March 26, 2027 | Good Friday |
| May 31, 2027 | Memorial Day |
| July 5, 2027 | Independence Day (observed) |
| September 6, 2027 | Labor Day |
| October 11, 2027 | Columbus Day |
| November 11, 2027 | Veterans' Day |
| November 25, 2027 | Thanksgiving |

On an early-close day, 15-minute and 1-hour windows end by the early close, and no daily window is listed for that session. None are scheduled today. Changes to the calendar are announced in the [changelog](https://docs.polymarket.us/changelog.md).

### How do I know when the next window opens?

Every window carries the start of the next window of the same length: `metals_next_window_start` on the Institutional API and `assetPriceTerms.nextWindowStart` on the Retail API. It equals the window's end while the market stays open, and points past the daily break, the weekend or a holiday when trading closes after the window. It always reflects the current holiday calendar.

### What happens during scheduled maintenance?

15-minute and 1-hour windows that would overlap a scheduled exchange maintenance are not listed. Daily windows are unaffected and are listed as usual. See [Trading Hours](https://docs.polymarket.us/learn/trading/access-and-limits/trading-hours.md) for the recurring maintenance window.

## Market Families

### How do Up/Down markets work?

Each window is its own market. A window opens for trading at its start time, not before. The open value is published as the "price to beat" (`price_to_beat` on the Institutional API, `assetPriceTerms.priceToBeat` on the Retail API) once Chainlink has published it, usually about a minute after the start, so for roughly the first minute a window trades without a price to beat. This is by design. At the end time, the close value is taken the same way. The long side of the contract pays \$1.00 when the close is greater than or equal to the open; otherwise the short side pays.

15-minute windows are listed about 12 hours ahead and 1-hour windows about 24 hours ahead, so at most about 48 fifteen-minute and 24 hourly windows per metal are listed at a time. There are fewer when the listing horizon reaches the daily break, the weekend or a holiday.

### How do the daily windows work?

Each daily window runs from the 6:15 PM ET evening open to 5:00 PM ET the next day (22 hours 45 minutes). There is one per overnight session, on Sunday, Monday, Tuesday, Wednesday and Thursday evenings: five a week per metal. Each daily is listed about 24 hours before it opens.

## Finding the Markets

### How do I find gold and silver markets on the Retail API?

Filter by category, `GET /v1/markets?categories=finance&closed=false`, then select markets whose `assetPriceTerms.asset.assetClass` is `ASSET_CLASS_COMMODITY`. `closed=false` returns only the window that is trading now in each series. Upcoming windows are listed as closed until they start, so request them without `closed=false`, or by slug. Their events use the series `gold-updown-15m`, `gold-updown-1h`, `gold-updown-1d`, `silver-updown-15m`, `silver-updown-1h` and `silver-updown-1d`. Each market carries a typed `assetPriceTerms` object with the window, the price to beat and, once known, the settlement price. See [Asset Price Market Fields](https://docs.polymarket.us/api-reference/market/overview.md#asset-price-market-fields). Spot price history is available from `GET /v1/asset-prices/history` with `commodity:gold` or `commodity:silver`, the same endpoint as crypto and with no authentication; see [Asset Prices](https://docs.polymarket.us/api-reference/asset-prices/overview.md).

### How do I find gold and silver instruments on the Institutional API?

Filter reference data by clearing symbol: `POST /v1/refdata/instruments` with `{"clearingSym": "CPAUSP-COMMODITY"}` for gold or `{"clearingSym": "CPAGSP-COMMODITY"}` for silver, or by series such as `{"eventSeries": "gold-updown-15m"}`. Identify the market from `metals_market_type` and the other fields documented in [Metals Schema](https://docs.polymarket.us/trader-guide/metals-schema.md). Never parse the symbol.

The reference data list is served from a cache, so a newly stamped `price_to_beat` or `metals_settlement_price` can take up to an hour to appear there. Read fresh prices from the Retail market endpoints, and the final settlement from `GET /v1/instruments/{symbol}/settlement`.


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.