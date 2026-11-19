> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Market Resolution

> Learn how Polymarket US determines outcomes for event contracts

Markets stay open until the outcome is known. Once the outcome becomes publicly known, the Exchange determines the result using publicly verifiable information.

## How Market Outcomes Are Determined

Each market asks a clear question about a real-world event. When the outcome becomes publicly known, the Exchange confirms it using the criteria defined in the market's description and rules.

Markets resolve using the **specific sources listed in the rules**. These sources provide the authoritative outcome. Some contracts also have backup sources that can be used if a listed source is unavailable; for sports markets, see the [Sports FAQs](https://docs.polymarket.us/faqs/sports-faqs.md).

All determinations follow the event-contract framework used across Polymarket US.

## Types of Resolution Sources

Common types of resolution sources are listed below. Each category has clear standards for what counts as official.

### Government

Government providers supply final, authoritative data for political, economic, and administrative outcomes (e.g., Congress, Bureau of Labor Statistics, National Weather Service).

### Sports

Sports markets resolve using results published by the governing league or competition organizer (e.g., professional football leagues, professional basketball leagues, professional baseball leagues).

### Financial benchmarks

Crypto price markets resolve on the published value of a named reference index, such as CF Benchmarks' Bitcoin Real-Time Index. Each market's rules state the index and how its value is calculated (for example, the average of the index prices in the final minute before the settlement time). Prices on exchanges or other indices do not count.

Gold and silver price markets resolve on Chainlink's spot price data streams for gold ([XAU/USD](https://data.chain.link/streams/xau-usd-forexprice-streams)) and silver ([XAG/USD](https://data.chain.link/streams/xag-usd-forexprice-streams)). Each market uses the spot price Chainlink publishes for the market's start time and end time, not an average, rounded to the nearest cent for gold and to three decimal places for silver. If a price has not been published, the market waits for it rather than settling on a fallback price. If the price is still missing an hour after the market ends, the Exchange settles the market manually. See the [Gold and Silver FAQs](https://docs.polymarket.us/faqs/metals-faqs.md).

WTI crude oil and natural gas price markets resolve on Chainlink's futures mid price data streams: US Oil (`NY-USOIL/USD-Streams-FuturesPrice`) for WTI crude oil futures and Natural Gas (`NatGas/USD-Streams-FuturesPrice`) for Henry Hub natural gas futures. Each price is the mid price Chainlink calculates from the bid and ask quotes for the front-month futures contract. It is not a traded price or an exchange settlement price. Only prices published while the stream marks the market as open count. Each market uses the mid price Chainlink publishes for the market's start time and end time, not an average. WTI is rounded half up to the nearest cent (0.005 rounds up to 0.01). Natural gas is rounded half up to four decimal places (0.00005 rounds up to 0.0001). Chainlink determines which contract month each stream follows and when it moves to the next one, and the published price is used without adjusting for that change. Missing prices are handled as for gold and silver. See the [Oil and Gas FAQs](https://docs.polymarket.us/faqs/oil-gas-faqs.md).

### News

Some markets use news outlets as resolution sources. When the rules list specific outlets, resolution comes from **those exact outlets**. Some markets rely on a single outlet, while others require **agreement** between several named outlets (e.g., major news outlets, wire services, national newsrooms).

## Timing of Resolution

Resolution occurs after the event outcome is publicly confirmed.

* **Sports markets**: Often resolve shortly after the official result is posted
* **Political or news markets**: May take longer if certification or official publication is required
* **Complex events**: May require additional verification before resolution

Resolution timing varies by event and depends on when reliable information becomes available.

## After Resolution

When a market resolves:

* Winning shares settle at **\$1.00**
* Losing shares settle at **\$0.00**
* Your Portfolio updates automatically when settlement completes

## Finality of Resolution

All resolutions are final in accordance with the [**Polymarket US Exchange Rulebook**](https://polymarketexchange.com/regulatory.html).


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.