> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Settlement API Overview

> Read an instrument’s final settlement price

## Endpoints

| Method | Endpoint | Description |
| - | - | - |
| `GET` | `/v1/instruments/{symbol}/settlement` | Get final settlement, including for terminated instruments |

Requires a bearer token with `read:marketdata` scope. No `x-participant-id` header is required. See [Authentication](/trader-guide/authentication).

## Response Fields

| Field | Description |
| - | - |
| `symbol` | Exact, case-sensitive instrument symbol |
| `priceScale` | Divide `stats.settlementPx` by this value to obtain the price |
| `stats` | Settlement fields; absent when no final settlement is available |
| `stats.settlementPx` | Raw settlement price; zero is valid |
| `stats.settlementPreliminary` | Present and `false` when `stats` is returned |
| `stats.settlementPriceCalculationMethod` | `SETTLEMENT_PRICE_CALCULATION_METHOD_EVENT_TIER_1` when `stats` is returned |
| `stats.settlementPriceCalculationText` | Settlement explanation, when available |
| `stats.settlementSetTime` | Time the settlement price was set, when available |

The newest record controls the result, so later reads can reflect corrections. A known instrument without a final settlement returns `200` with `stats` absent; an unknown symbol returns `404`. A present zero price is a valid settlement. This endpoint reports the instrument price, not account payout completion.

## Example Usage

```bash theme={null}
curl 'https://api.prod.polymarketexchange.com/v1/instruments/YOUR_INSTRUMENT_SYMBOL/settlement' -H "Authorization: Bearer $ACCESS_TOKEN"
```

Example response for a final zero settlement (`int64` values are JSON strings):

```json theme={null}
{
  "symbol": "YOUR_INSTRUMENT_SYMBOL",
  "stats": {
    "settlementPx": "0",
    "settlementPreliminary": false,
    "settlementPriceCalculationMethod": "SETTLEMENT_PRICE_CALCULATION_METHOD_EVENT_TIER_1"
  },
  "priceScale": "100"
}
```

For gRPC, see [Instrument Settlement](/streaming-endpoints/proto-reference#instrument-settlement).


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.