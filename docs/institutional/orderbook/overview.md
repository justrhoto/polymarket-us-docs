> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Order Book API Overview

> Access L2 order book snapshots and best bid/offer (BBO) data

<Warning>
  **Prefer Streaming for Production Use**

  This polling API is subject to rate limits. For production applications that need continuous market data, use the [gRPC Market Data Stream](/streaming-endpoints/market-data-stream) instead. The streaming API provides real-time updates with lower latency and no rate limit concerns.
</Warning>

## Endpoints

| Method | Endpoint                     | Description                |
| ------ | ---------------------------- | -------------------------- |
| `GET`  | `/v1/orderbook/{symbol}`     | Get L2 order book snapshot |
| `GET`  | `/v1/orderbook/{symbol}/bbo` | Get best bid/offer         |

<Info>
  **No Participant ID Required**

  These endpoints only require Auth0 JWT authentication with `read:marketdata` scope. You do not need to provide the `x-participant-id` header or complete KYC onboarding to access order book data.
</Info>

## L2 Order Book

The L2 (Level 2) order book provides aggregated price levels showing the total quantity available at each price point. This is useful for:

* Understanding market depth at different price levels
* Analyzing liquidity distribution
* Building trading strategies based on order book imbalance

### Request Parameters

| Parameter | Type    | Required | Description                                            |
| --------- | ------- | -------- | ------------------------------------------------------ |
| `symbol`  | string  | Yes      | Instrument symbol (e.g., "tec-nfl-sbw-2026-02-08-kc")  |
| `depth`   | integer | No       | Number of price levels to return (default: 3, max: 10) |

### Response Fields

| Field          | Type     | Description                                              |
| -------------- | -------- | -------------------------------------------------------- |
| `symbol`       | string   | Instrument symbol                                        |
| `bids`         | array    | Bid side of order book (sorted by price descending)      |
| `offers`       | array    | Offer/ask side of order book (sorted by price ascending) |
| `state`        | string   | Current trading state of the instrument (optional)       |
| `stats`        | object   | Market statistics (last trade, OHLC, etc.)               |
| `transactTime` | datetime | Server timestamp of the data                             |

### Book Entry Structure

Each entry in the `bids` and `offers` arrays contains:

| Field | Type   | Description                  |
| ----- | ------ | ---------------------------- |
| `px`  | string | Price level                  |
| `qty` | string | Total quantity at this price |

## Best Bid/Offer (BBO)

The BBO endpoint returns only the top of book - the best (highest) bid and best (lowest) offer. This is the most efficient way to get current market prices.

### Response Fields

| Field          | Type     | Description                                           |
| -------------- | -------- | ----------------------------------------------------- |
| `symbol`       | string   | Instrument symbol                                     |
| `bestBid`      | object   | Best bid (highest buy price)                          |
| `bestOffer`    | object   | Best offer (lowest sell price)                        |
| `spread`       | string   | Spread in price units (best\_offer.px - best\_bid.px) |
| `midPrice`     | string   | Mid price ((best\_bid.px + best\_offer.px) / 2)       |
| `state`        | string   | Current trading state (optional)                      |
| `transactTime` | datetime | Server timestamp                                      |

<Tip>
  **Instrument State Tracking:** The `state` field in order book and BBO responses is optional. The preferred approach is to use `ListInstruments` to get and cache the initial state, then subscribe to the instrument state change subscription for real-time state updates.
</Tip>

## Instrument States

Instruments follow the primary lifecycle: PENDING → OPEN → CLOSED → EXPIRED → TERMINATED. Instruments may also be SUSPENDED or HALTED during their lifecycle.

### Primary State Flow

| State                                               | Description                                                                                                                                                                                                      |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PENDING`                                           | Initial state for a newly created instrument which has not yet begun trading.                                                                                                                                    |
| `OPEN`                                              | In this state, the instrument is open for continuous order entry and matching.                                                                                                                                   |
| `CLOSED`                                            | In this state, orders can not be entered, modified, or canceled, and no matching occurs. Any existing Day orders will be expired.                                                                                |
| `EXPIRED`                                           | An instrument moves to this state when its Expiration Date/Time is reached. In this state, any resting orders are expired and no new orders can be entered.                                                      |
| `TERMINATED`                                        | When an instrument's Termination Date is reached, the order book is removed from the matching engine, orders are canceled, and positions are closed. Historical data will still remain in Polymarket US ledgers. |

### Exception States

| State                                               | Description                                                                                   |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `SUSPENDED`                                         | Orders can be canceled but no matching occurs, and no order entry or modification is allowed. |
| `HALTED`                                            | This state is similar to SUSPENDED, with the exception that orders cannot be canceled.        |

### Other Possible States

| State                                               | Description                                                                                                                                                                                                                                                                                       |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PREOPEN`                                           | Orders can be entered and modified, but no matching occurs. When the instrument transitions to an OPEN state, the orders entered during PREOPEN will match at a single opening price that is automatically determined by an algorithm that is designed to maximize the volume traded at the open. |
| `MATCH_AND_CLOSE_AUCTION`                           | This state is similar to PREOPEN, with the exception that matching will occur upon the transition of this state to any other state. This state is useful if you want matching to occur at the end of the state, but you don't want the instrument to be open after.                               |

## Example Usage

### Get L2 Order Book

```bash theme={null}
curl -X GET "https://api.preprod.polymarketexchange.com/v1/orderbook/tec-nfl-sbw-2026-02-08-kc?depth=5" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get BBO

```bash theme={null}
curl -X GET "https://api.preprod.polymarketexchange.com/v1/orderbook/tec-nfl-sbw-2026-02-08-kc/bbo" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## When to Use

| Use Case                      | Recommended API                                                    |
| ----------------------------- | ------------------------------------------------------------------ |
| Continuous market data feed   | [gRPC Market Data Stream](/streaming-endpoints/market-data-stream) |
| One-time snapshot for display | REST Order Book (this API)                                         |
| Building a trading UI         | [gRPC Market Data Stream](/streaming-endpoints/market-data-stream) |
| Quick price check             | REST BBO endpoint                                                  |

<Tip>
  **Streaming First Architecture**

  For any use case requiring more than occasional snapshots, use the streaming API. It provides:

  * Real-time updates as they happen
  * No rate limiting concerns
  * Lower latency than polling
  * Reduced API calls and infrastructure load
</Tip>
