> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Asset Prices API Overview

> Reference price history for crypto, gold and silver price markets

# Asset Prices API

The Asset Prices API returns the reference prices that crypto, gold and silver price markets settle on, as OHLC candles. Use it to chart the price next to an Up/Down or ladder market, to seed a live price display, or to check a market's `priceToBeat` and `settlementPrice` against the source.

| Asset | `assets` value | Source | Decimals |
| - | - | - | - |
| Bitcoin and other crypto | `crypto:btc`, ... | The crypto market's reference index, e.g. CF Benchmarks' BRTI | 2 for BTC |
| Gold | `commodity:gold` | Chainlink `XAU/USD-Streams-ForexPrice` spot stream | 2 |
| Silver | `commodity:silver` | Chainlink `XAG/USD-Streams-ForexPrice` spot stream | 3 |

## Endpoints

| Method | Endpoint | Description |
| - | - | - |
| `GET` | `/v1/asset-prices/history` | Bucketed OHLC price series for one or more assets |

No authentication is required.

## Query Parameters

| Parameter | Type | Description |
| - | - | - |
| `assets` | string\[] | Assets in canonical `<class>:<symbol>` form, e.g. `crypto:btc`, `commodity:gold` or `commodity:silver`. Repeat the parameter for several assets (`?assets=crypto:btc&assets=commodity:gold`), at most 10. This is the same value as `assetPriceTerms.asset` on a market. |
| `from` | integer (unix seconds) | Required. Start of the window. Aligned down to the bucket, and raised when the window would hold more than 3600 candles. |
| `to` | integer (unix seconds) | End of the window. `0` or a future value means now; the in-progress bucket is included. |
| `bucket` | enum | Required candle width: `ASSET_PRICE_BUCKET_1S`, `_5S`, `_15S`, `_1M`, `_5M`, `_15M`, `_1H`, `_1D`. Every width is accepted for both crypto and commodity assets. |

The 3600-candle cap is the only size limit, so the widest window scales with the bucket: an hour at `1S`, 60 hours at `1M`, 150 days at `1H`. The effective `from` and `to` after alignment are echoed on each series.

## Example

```bash theme={null}
GET /v1/asset-prices/history?assets=crypto:btc&from=1789949700&to=1789950600&bucket=ASSET_PRICE_BUCKET_1M
```

```json theme={null}
{
  "series": [
    {
      "asset": { "assetClass": "ASSET_CLASS_CRYPTO", "symbol": "btc" },
      "currency": "USD",
      "bucket": "ASSET_PRICE_BUCKET_1M",
      "from": 1789949700,
      "to": 1789950600,
      "candles": [
        { "timestamp": 1789949700, "open": "81646.93", "high": "81690.04", "low": "81633.83", "close": "81653.35", "tickCount": 60 },
        { "timestamp": 1789949760, "open": "81659.13", "high": "81709.62", "low": "81536.86", "close": "81537.63", "tickCount": 60 }
      ]
    }
  ]
}
```

Gold and silver use the same request with `commodity:gold` or `commodity:silver`. Their candles carry the raw Chainlink spot price, one value per second, so a `1S` candle usually has `tickCount: 1`. `0` marks a second with no publication:

```bash theme={null}
GET /v1/asset-prices/history?assets=commodity:gold&from=1792593000&to=1792593003&bucket=ASSET_PRICE_BUCKET_1S
```

```json theme={null}
{
  "series": [
    {
      "asset": { "assetClass": "ASSET_CLASS_COMMODITY", "symbol": "gold" },
      "currency": "USD",
      "bucket": "ASSET_PRICE_BUCKET_1S",
      "from": 1792593000,
      "to": 1792593004,
      "candles": [
        { "timestamp": 1792593000, "open": "4133.50", "high": "4133.50", "low": "4133.50", "close": "4133.50", "tickCount": 1 },
        { "timestamp": 1792593001, "open": "4133.31", "high": "4133.31", "low": "4133.31", "close": "4133.31", "tickCount": 1 },
        { "timestamp": 1792593002, "open": "4133.55", "high": "4133.55", "low": "4133.55", "close": "4133.55", "tickCount": 1 },
        { "timestamp": 1792593003, "open": "4133.71", "high": "4133.71", "low": "4133.71", "close": "4133.71", "tickCount": 1 }
      ]
    }
  ]
}
```

## Response Fields

| Field | Type | Description |
| - | - | - |
| `series[].asset` | object | The asset this series belongs to (`assetClass` is `ASSET_CLASS_CRYPTO` or `ASSET_CLASS_COMMODITY`). Match series to your request by this field, never by position: REST returns series sorted by symbol. |
| `series[].currency` | string | ISO 4217 currency every candle price is quoted in |
| `series[].bucket` | enum | Candle width of the series |
| `series[].from` / `series[].to` | integer | Effective window bounds (unix seconds) after alignment and clamping |
| `series[].candles[].timestamp` | integer | Bucket start (unix seconds) |
| `series[].candles[].open` / `high` / `low` / `close` | string (decimal) | Prices in the bucket, as decimal strings |
| `series[].candles[].tickCount` | integer | Number of price publications in the bucket. `0` marks a gap-filled bucket: `close` is carried forward from the previous bucket and `open`, `high` and `low` equal it. |

Candles are dense and ascending, one per bucket in the effective window. An unknown symbol, or an asset whose markets are not available yet, fails the whole request with HTTP `404` (`asset price history is not available`). An available asset with no prices yet returns an empty series.

## Relationship to Markets

* `assetPriceTerms.asset` on a crypto, gold or silver market is the `assets` value to chart against.
* A crypto Up/Down market's `priceToBeat` is the simple average of the 60 one-second prices in the sixty seconds before `windowStart`, from `T − 60 s` up to but not including `windowStart` itself (the interval `[T − 60 s, T)`); its `settlementPrice` is the same statistic at `windowEnd`. The reading 60 seconds before the boundary is part of the average and the reading exactly at the boundary is not. To reproduce it, query `bucket=ASSET_PRICE_BUCKET_1S` with `from = T − 60` and `to = T − 1` and average the 60 `close` values. For `cpc-btc-updown-15m-2026-10-06-1900z`, the candles from 18:59:00 to 18:59:59 inclusive average to the published `priceToBeat` of 85501.45; the minute 18:59:01 to 19:00:00 averages to 85501.37 and does not match.
* A gold or silver Up/Down market's `priceToBeat` is a single spot value, not an average: the value Chainlink publishes for `windowStart`. Its `settlementPrice` is the value for `windowEnd`. To check one, query `bucket=ASSET_PRICE_BUCKET_1S` with `from = T` and `to = T + 1` and read the `close` of the candle whose `timestamp` is `T`. For `cpausp-gold-updown-15m-2026-10-21-1430z`, the candle at 14:30:00 UTC closes at 4133.50, the published `priceToBeat`, and the candle at 14:45:00 UTC closes at 4128.62, the published `settlementPrice`. The stamped values are authoritative.
* Poll the latest candle for a live price display. Prices are published about once per second.

## Closed Hours

Gold and silver have a price only while the metals market is open. Chainlink publishes no spot price from 5:00 PM to 6:00 PM ET each day or at the weekend, and none, or only part of a day, on some holidays. No windows are listed on the holidays in the [Gold and Silver FAQs](https://docs.polymarket.us/faqs/metals-faqs.md), even when prices are published. Candles in a closed period are gap-filled: `tickCount` is `0` and `close` carries the last price forward. Drop `tickCount: 0` candles if you chart only published prices.


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.