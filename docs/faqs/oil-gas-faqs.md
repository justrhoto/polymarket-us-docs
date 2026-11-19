> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Oil and Gas FAQs

> Frequently asked questions about trading WTI crude oil and natural gas Futures Price Contracts on Polymarket US

## General Rules

### What kinds of oil and gas contracts are offered?

Polymarket US offers Event Contracts that settle on the futures mid price of WTI crude oil and natural gas: "WTI Crude Oil Futures Price Contracts" (product `CPWTIF`) and "Natural Gas Futures Price Contracts" (product `CPNGF`). One automated market family is listed on a recurring schedule:

| Family | Question | Cadence |
| - | - | - |
| Up/Down | Will the price of WTI crude oil futures (natural gas futures) close the window at or above its open? | 15-minute, 1-hour and daily windows during the CME Globex trading hours |

The markets are titled "WTI Crude Up or Down 15m", "WTI Crude Up or Down Hourly", "Natural Gas Up or Down Daily" and so on. There are no 5-minute windows, and no Above/Below, Price Range or One-Touch markets on oil or gas yet.

> [!NOTE]
>
> WTI and natural gas Up/Down windows are listed in production from November 18, 2026, as announced in the [changelog](https://docs.polymarket.us/changelog.md). For the fields that identify each market, see [Asset Up/Down Schema](https://docs.polymarket.us/trader-guide/asset-updown-schema.md).

### How are oil and gas contracts settled?

Every window settles on one of Chainlink's futures mid price data streams:

| Market | Chainlink stream | Tracks | Feed ID |
| - | - | - | - |
| WTI | US Oil (`NY-USOIL/USD-Streams-FuturesPrice`) | Front-month NYMEX WTI crude oil futures (CL) | `0x000e1d107999554713afbcea008e89815bdcc2027ca8433ed04be316fd446668` |
| Natural gas | Natural Gas (`NatGas/USD-Streams-FuturesPrice`) | Front-month NYMEX Henry Hub natural gas futures (NG) | `0x000e74d63a589ecd8de6a90eda318ee230c1868941bd2249b50699da3301b479` |

Each price is the mid price that Chainlink calculates from the bid and ask quotes for the front-month futures contract. **It is not a traded price or an exchange settlement price.** Only prices published while the stream marks the market as open count. Prices on other venues have no effect on settlement.

The open value is the mid price Chainlink publishes for the window's start time, and the close value is the mid price it publishes for the window's end time. These are **single values, not averages**.

### How are prices rounded?

Each window states its rounding in its rules, and carries the same number of decimal places in `asset_price_decimals` (Institutional API) and `assetPriceTerms.priceDecimals` (Retail API). The exchange rounds the published mid price half up. It never truncates it.

| Market | Decimals | Rounding |
| - | - | - |
| WTI | 2 (nearest cent) | 0.005 rounds up to 0.01, so 81.235 becomes 81.24 |
| Natural gas | 4 | 0.00005 rounds up to 0.0001 |

The decimals are the same on 15-minute, 1-hour and daily windows. A window keeps the decimals it was listed with, even if the decimals of new windows change later. Always read the decimals on the window, and show and compare every price of a window at those decimals, so the price you see is the price that settles.

### How do ties work?

A window whose close value equals its open value, after rounding, settles **Up**.

### When does settlement occur?

A window settles once Chainlink has published the closing value, usually about a minute after the window ends. The instrument's expiration is set 30 minutes after the end time to leave time for resolution. Trading ends at the end time regardless.

### Can a market settle early?

No. Every window settles at its stated end time.

### What happens if a price is missing?

A window settles only on the value Chainlink publishes for its exact start and end times. It never settles on a neighbouring second, a last known price or any other fallback.

* If the closing value has not been published, the window is held and does not settle.
* If the opening value has not been published, the window trades without a confirmed price to beat until it is. If it arrives in the last 15 seconds of the window or later, the window never shows a confirmed price to beat, but it still settles on the published open value. A [pending price to beat](#what-is-the-pending-price-to-beat) can show in the meantime. It is for display only, and the window settles on the published open value even if the two differ.
* If a value is still missing 60 minutes after the window ends, the exchange settles the window manually.

### What happens when the futures contract rolls?

Each stream follows the front-month contract. Chainlink determines which contract month the stream follows and when it moves to the next one, and the published price is used without adjusting for that change. So far Chainlink has switched each stream at 6:00 PM ET on the evening before the expiring contract's last trading day, when that evening's session opens. A switch at that time lands at the reopen after the daily break, so no window spans it.

The first window after a roll can open far from the last close before it, because the two prices belong to different contracts. That step is a change of contract, not a price move, and it never decides a window. Each window names its contract month: `asset_contract_month` on the Institutional API and `assetPriceTerms.contractMonth` on the Retail API, as `YYYY-MM`. The [Asset Prices API](https://docs.polymarket.us/api-reference/asset-prices/overview.md#futures-contract-rolls) lists the rolls inside a price series. If a window's close were on a different contract from its open, the exchange would settle that window manually.

The switches expected through December 2026, if Chainlink keeps that timing:

| Market | Expiring contract | Last trading day | Stream switches to the next month (ET) |
| - | - | - | - |
| WTI | December 2026 | Friday, November 20 | Thursday, November 19, 6:00 PM |
| Natural gas | December 2026 | Wednesday, November 25 | Tuesday, November 24, 6:00 PM |
| WTI | January 2027 | Monday, December 21 | Sunday, December 20, 6:00 PM |
| Natural gas | January 2027 | Tuesday, December 29 | Monday, December 28, 6:00 PM |

Chainlink makes each switch, and `asset_contract_month` shows the contract each window actually used. On the last trading day the expiring contract still trades until its own close, but the stream has already moved to the next month, so that day lists like any other day.

### Do oil and gas contracts trade around the clock?

No. They follow the CME Globex hours for energy futures, Sunday 6:00 PM ET to Friday 5:00 PM ET with a daily break from 5:00 PM to 6:00 PM ET. Windows are listed from Sunday 6:15 PM ET to Friday 5:00 PM ET:

* Nothing is listed from Friday 5:00 PM ET to Sunday 6:15 PM ET.
* No window runs from 5:00 PM to 6:15 PM ET on any day.
* No window starts at the 6:00 PM ET reopen. The first 15-minute window of each evening starts at 6:15 PM ET and the first 1-hour window at 7:00 PM ET.
* The last windows before the break are 4:45 to 5:00 PM ET (15-minute) and 4:00 to 5:00 PM ET (1-hour).
* A window is listed only if it lies wholly inside the trading hours.

The exchange's trade-day roll at 5:00 PM ET applies as on every other market.

### What happens on holidays and early closes?

The exchange follows the CME Globex holiday hours for WTI and natural gas. This calendar differs from the gold and silver calendar in the [Gold and Silver FAQs](https://docs.polymarket.us/faqs/metals-faqs.md).

A full-close holiday removes the session that closes on that date: no window runs from 6:15 PM ET the evening before the holiday to 5:00 PM ET on the holiday. Full closes scheduled today:

| Date | Holiday |
| - | - |
| December 25, 2026 | Christmas Day |
| January 1, 2027 | New Year's Day |
| March 26, 2027 | Good Friday |
| December 24, 2027 | Christmas Day (observed) |

On an early-close day, the session that closes on that date ends at the early close. 15-minute and 1-hour windows end by the early close, and no daily window is listed for that session. Windows start again at 6:15 PM ET on the next evening the market reopens. That is the same evening after most early closes, and the Sunday after a Friday early close or when a full-close holiday follows, as on December 24, 2026. `asset_next_window_start` gives the exact time. For example, on Thanksgiving, November 26, 2026, the last 15-minute window runs from 2:15 to 2:30 PM ET and the last 1-hour window from 1:00 to 2:00 PM ET. Early closes scheduled today:

| Date | Holiday | Early close (ET) |
| - | - | - |
| November 26, 2026 | Thanksgiving | 2:30 PM |
| November 27, 2026 | Day after Thanksgiving | 2:45 PM |
| December 24, 2026 | Christmas Eve | 1:45 PM |
| January 18, 2027 | Martin Luther King Day | 2:30 PM |
| February 15, 2027 | Presidents' Day | 2:30 PM |
| May 31, 2027 | Memorial Day | 2:30 PM |
| June 18, 2027 | Juneteenth (observed) | 1:00 PM |
| July 5, 2027 | Independence Day (observed) | 2:30 PM |
| September 6, 2027 | Labor Day | 2:30 PM |
| November 25, 2027 | Thanksgiving | 2:30 PM |
| November 26, 2027 | Day after Thanksgiving | 2:45 PM |

CME confirms holiday hours about two weeks ahead. Changes to the calendar are announced in the [changelog](https://docs.polymarket.us/changelog.md).

### How do I know when the next window opens?

Every window carries the start of the next window of the same length: `asset_next_window_start` on the Institutional API and `assetPriceTerms.nextWindowStart` on the Retail API. It equals the window's end while the market stays open, and points past the daily break, the weekend or a holiday when trading closes after the window. It always reflects the current holiday calendar.

### What happens during scheduled maintenance?

15-minute and 1-hour windows that would overlap a scheduled exchange maintenance are not listed. Daily windows are unaffected and are listed as usual. See [Trading Hours](https://docs.polymarket.us/learn/trading/access-and-limits/trading-hours.md) for the recurring maintenance window.

## Market Families

### How do Up/Down markets work?

Each window is its own market. A window opens for trading at its start time, not before. The open value is published as the "price to beat" (`price_to_beat` on the Institutional API, `assetPriceTerms.priceToBeat` on the Retail API) once Chainlink has published it, usually about a minute after the start, so for roughly the first minute a window trades without a confirmed price to beat. This is by design. At the end time, the close value is taken the same way. The long side of the contract pays \$1.00 when the close is greater than or equal to the open; otherwise the short side pays.

15-minute windows are listed about 12 hours ahead and 1-hour windows about 24 hours ahead, so at most about 48 fifteen-minute and 24 hourly windows per market are listed at a time. There are fewer when the listing horizon reaches the daily break, the weekend or a holiday.

### What is the pending price to beat?

A window can show a pending price to beat before the confirmed one arrives: `pending_price_to_beat` on the Institutional API and `assetPriceTerms.pendingPriceToBeat` on the Retail API. It is Chainlink's report for exactly the window start as the exchange received it, rounded like the price to beat, and it usually appears 1 to 2 seconds after the window opens.

It is for display only. It can be absent, for example when Chainlink has no report for exactly the window start. In rare cases it can differ from the confirmed price to beat, and the window settles only on the confirmed price to beat. Show the confirmed price to beat when it is present, else the pending value labelled as pending. On the Retail API the pending field returns to `null` once `priceToBeat` is set. On the Institutional API the key stays on the instrument.

### How do the daily windows work?

Each daily window runs from the 6:15 PM ET evening open to 5:00 PM ET the next day (22 hours 45 minutes). There is one per overnight session, on Sunday, Monday, Tuesday, Wednesday and Thursday evenings: five a week per market. Each daily is listed about 24 hours before it opens. A full-close holiday removes the daily of the session it removes, and no daily is listed for a session that closes early.

## Finding the Markets

### How do I find oil and gas markets on the Retail API?

Filter by category, `GET /v1/markets?categories=finance&closed=false`, then select markets whose `assetPriceTerms.asset.symbol` is `wti` or `natgas` (with `assetClass` `ASSET_CLASS_COMMODITY`). `closed=false` returns only the window that is trading now in each series. Upcoming windows are listed as closed until they start, so request them without `closed=false`, or by slug. Their events use the series `wti-updown-15m`, `wti-updown-1h`, `wti-updown-1d`, `natgas-updown-15m`, `natgas-updown-1h` and `natgas-updown-1d`.

Each market carries a typed `assetPriceTerms` object with the window, the price to beat, the decimals (`priceDecimals`), the contract month (`contractMonth`) and, once known, the settlement price. See [Asset Price Market Fields](https://docs.polymarket.us/api-reference/market/overview.md#asset-price-market-fields). Price history is available from `GET /v1/asset-prices/history` with `commodity:wti` or `commodity:natgas`, the same endpoint as crypto, gold and silver, and with no authentication; see [Asset Prices](https://docs.polymarket.us/api-reference/asset-prices/overview.md).

### How do I find oil and gas instruments on the Institutional API?

Filter reference data by clearing symbol: `POST /v1/refdata/instruments` with `{"clearingSym": "CPWTIF-COMMODITY"}` for WTI or `{"clearingSym": "CPNGF-COMMODITY"}` for natural gas, or by series such as `{"eventSeries": "natgas-updown-15m"}`. Identify the market from `asset_market_type` and the other fields documented in [Asset Up/Down Schema](https://docs.polymarket.us/trader-guide/asset-updown-schema.md). Never parse the symbol.

The reference data list is served from a cache, so a newly stamped `price_to_beat`, `pending_price_to_beat`, `asset_contract_month` or `asset_settlement_price` can take up to an hour to appear there. Read fresh prices from the Retail market endpoints, and the final settlement from `GET /v1/instruments/{symbol}/settlement`.


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.