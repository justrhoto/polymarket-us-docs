> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Quickstart

> Get started with the TypeScript SDK

## Installation

```bash theme={null}
npm install polymarket-us
```

Requires Node.js 18+. For WebSocket on Node \< 22, also install `ws`.

[GitHub](https://github.com/Polymarket/polymarket-us-typescript) · [npm](https://www.npmjs.com/package/polymarket-us)

***

## Configuration

```typescript theme={null}
import { PolymarketUS } from 'polymarket-us';

const client = new PolymarketUS({
  keyId: process.env.POLYMARKET_KEY_ID,
  secretKey: process.env.POLYMARKET_SECRET_KEY,
  timeout: 30000,  // optional, default 30000ms
});
```

Generate API keys at [polymarket.us/developer](https://polymarket.us/developer).

***

## Public Endpoints

No authentication required for market data:

```typescript theme={null}
import { PolymarketUS } from 'polymarket-us';

const client = new PolymarketUS();

// Events
const events = await client.events.list({ limit: 10, active: true });
const event = await client.events.retrieveBySlug('super-bowl-2025');

// Markets
const markets = await client.markets.list({ limit: 10 });
const market = await client.markets.retrieveBySlug('btc-100k');
const book = await client.markets.book('btc-100k');
const bbo = await client.markets.bbo('btc-100k');

// Search
const results = await client.search.query({ query: 'bitcoin' });

// Series and Sports
const series = await client.series.list();
const sports = await client.sports.list();
```

***

## Authenticated Endpoints

Trading requires API credentials:

```typescript theme={null}
import { PolymarketUS } from 'polymarket-us';

const client = new PolymarketUS({
  keyId: process.env.POLYMARKET_KEY_ID,
  secretKey: process.env.POLYMARKET_SECRET_KEY,
});

// Account
const balances = await client.account.balances();

// Portfolio
const positions = await client.portfolio.positions();
const activities = await client.portfolio.activities();

// Orders
const openOrders = await client.orders.list();
const order = await client.orders.create({
  marketSlug: 'your-market-slug',
  intent: 'ORDER_INTENT_BUY_LONG',
  type: 'ORDER_TYPE_LIMIT',
  price: { value: '0.555', currency: 'USD' },
  quantity: 0.5,
  tif: 'TIME_IN_FORCE_GOOD_TILL_CANCEL',
});
```

***

## Error Handling

```typescript theme={null}
import {
  PolymarketUS,
  AuthenticationError,
  BadRequestError,
  NotFoundError,
  RateLimitError,
} from 'polymarket-us';

try {
  const order = await client.orders.create({ marketSlug: '...' });
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.error('Invalid credentials');
  } else if (error instanceof BadRequestError) {
    console.error('Invalid parameters:', error.message);
  } else if (error instanceof RateLimitError) {
    console.error('Rate limited');
  } else if (error instanceof NotFoundError) {
    console.error('Not found');
  }
}
```

### Error Types

| Exception             | Description                    |
| --------------------- | ------------------------------ |
| `AuthenticationError` | Invalid or missing credentials |
| `BadRequestError`     | Invalid request parameters     |
| `NotFoundError`       | Resource not found             |
| `RateLimitError`      | Rate limit exceeded            |
| `APITimeoutError`     | Request timed out              |
| `APIConnectionError`  | Network connection error       |
