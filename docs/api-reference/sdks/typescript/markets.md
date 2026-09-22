> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Markets

> Query market data, order books, and prices

The Markets resource provides access to market information, pricing, and order book data. Markets represent individual tradeable contracts within an event.

## Methods

| Method                 | Endpoint                            | Description                 |
| ---------------------- | ----------------------------------- | --------------------------- |
| `list(params?)`        | `GET /v1/markets`                   | List markets with filtering |
| `retrieve(id)`         | `GET /v1/market/id/{id}`            | Get market by ID            |
| `retrieveBySlug(slug)` | `GET /v1/market/slug/{slug}`        | Get market by slug          |
| `book(slug)`           | `GET /v1/markets/{slug}/book`       | Get full order book         |
| `bbo(slug)`            | `GET /v1/markets/{slug}/bbo`        | Get best bid/offer          |
| `settlement(slug)`     | `GET /v1/markets/{slug}/settlement` | Get settlement price        |

***

## list

Fetch a paginated list of markets with optional filters.

```typescript theme={null}
const markets = await client.markets.list({
  limit: 20,
  active: true,
  categories: ['sports', 'crypto'],
});

for (const market of markets.markets) {
  console.log(`${market.slug}: ${market.question}`);
}
```

### Parameters

| Parameter           | Type      | Description                                                   |
| ------------------- | --------- | ------------------------------------------------------------- |
| `limit`             | number    | Maximum results to return                                     |
| `offset`            | number    | Pagination offset                                             |
| `active`            | boolean   | Filter by active trading status                               |
| `closed`            | boolean   | Filter by closed status                                       |
| `archived`          | boolean   | Filter by archived status                                     |
| `categories`        | string\[] | Filter by category slugs                                      |
| `sportsMarketTypes` | string\[] | Filter by sports market type (MONEYLINE, SPREAD, TOTAL, PROP) |
| `volumeNumMin`      | number    | Minimum trading volume                                        |
| `liquidityNumMin`   | number    | Minimum liquidity                                             |

### Response Fields

| Field            | Type    | Description                   |
| ---------------- | ------- | ----------------------------- |
| `id`             | number  | Unique market identifier      |
| `slug`           | string  | URL-friendly identifier       |
| `question`       | string  | Market question               |
| `description`    | string  | Detailed description          |
| `active`         | boolean | Whether market accepts orders |
| `lastTradePrice` | number  | Most recent trade price       |
| `bestBid`        | number  | Best bid price                |
| `bestAsk`        | number  | Best ask price                |
| `volume`         | string  | Total trading volume          |
| `liquidity`      | string  | Current liquidity             |

***

## retrieveBySlug

Get a single market by its URL slug.

```typescript theme={null}
const market = await client.markets.retrieveBySlug('btc-100k-2025');

console.log(`Question: ${market.question}`);
console.log(`Status: ${market.active}`);
console.log(`Last Price: ${market.lastTradePrice}`);
```

***

## book

Get the full order book with all bid and offer levels.

```typescript theme={null}
const book = await client.markets.book('btc-100k-2025');

console.log(`State: ${book.marketData.state}`);
console.log(`Bids: ${book.marketData.bids.length}`);
console.log(`Offers: ${book.marketData.offers.length}`);

for (const bid of book.marketData.bids.slice(0, 5)) {
  console.log(`  $${bid.px.value} x ${bid.qty}`);
}
```

### Response Fields

| Field        | Type   | Description                          |
| ------------ | ------ | ------------------------------------ |
| `marketSlug` | string | Market identifier                    |
| `bids`       | array  | Buy orders (highest price first)     |
| `offers`     | array  | Sell orders (lowest price first)     |
| `state`      | string | Market state (OPEN, SUSPENDED, etc.) |
| `stats`      | object | Market statistics                    |

***

## bbo

Get best bid/offer only. Use this lightweight endpoint when you only need top-of-book prices.

```typescript theme={null}
const bbo = await client.markets.bbo('btc-100k-2025');

const data = bbo.marketData;
console.log(`Best Bid: $${data.bestBid.value}`);
console.log(`Best Ask: $${data.bestAsk.value}`);
console.log(`Last Trade: $${data.lastTradePx.value}`);
```

### Response Fields

| Field          | Type   | Description              |
| -------------- | ------ | ------------------------ |
| `bestBid`      | Amount | Best (highest) bid price |
| `bestAsk`      | Amount | Best (lowest) ask price  |
| `lastTradePx`  | Amount | Last trade price         |
| `bidDepth`     | number | Number of bid levels     |
| `askDepth`     | number | Number of ask levels     |
| `openInterest` | string | Current open interest    |

***

## settlement

Get the settlement price for a resolved market.

```typescript theme={null}
const settlement = await client.markets.settlement('btc-100k-2025');

console.log(`Settlement: $${settlement.settlement}`);
```

Settlement values are typically `0.00` (No) or `1.00` (Yes).

<Tip>
  For real-time market data, use the [WebSocket](/api-reference/sdks/typescript/websocket) markets stream instead of polling.
</Tip>
