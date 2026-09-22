> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# WebSocket

> Real-time streaming data

The WebSocket resource provides real-time streaming data for market information and private user data.

## Methods

| Method      | Endpoint                                | Description                        |
| ----------- | --------------------------------------- | ---------------------------------- |
| `private()` | `wss://api.polymarket.us/v1/ws/private` | Orders, positions, balance updates |
| `markets()` | `wss://api.polymarket.us/v1/ws/markets` | Market data and trades             |

***

## private

Connect to the private WebSocket for real-time order, position, and balance updates.

```typescript theme={null}
import { PolymarketUS } from 'polymarket-us';

const client = new PolymarketUS({
  keyId: process.env.POLYMARKET_KEY_ID,
  secretKey: process.env.POLYMARKET_SECRET_KEY,
});

const ws = client.ws.private();

// Register event handlers
ws.on('orderSnapshot', (data) => console.log('Orders:', data));
ws.on('orderUpdate', (data) => console.log('Order update:', data));
ws.on('positionSnapshot', (data) => console.log('Positions:', data));
ws.on('positionUpdate', (data) => console.log('Position update:', data));
ws.on('accountBalanceSnapshot', (data) => console.log('Balance:', data));
ws.on('error', (e) => console.error('Error:', e));

await ws.connect();

// Subscribe to updates
ws.subscribeOrders('my-orders');
ws.subscribePositions('my-positions');
ws.subscribeAccountBalance('my-balance');
```

### Private Subscription Types

| Type                                | Description                 |
| ----------------------------------- | --------------------------- |
| `SUBSCRIPTION_TYPE_ORDER`           | Order updates and snapshots |
| `SUBSCRIPTION_TYPE_POSITION`        | Position changes            |
| `SUBSCRIPTION_TYPE_ACCOUNT_BALANCE` | Balance updates             |

### Private Events

| Event                    | Description                       |
| ------------------------ | --------------------------------- |
| `orderSnapshot`          | Initial snapshot of all orders    |
| `orderUpdate`            | Order state change                |
| `positionSnapshot`       | Initial snapshot of all positions |
| `positionUpdate`         | Position change                   |
| `accountBalanceSnapshot` | Initial balance snapshot          |
| `accountBalanceUpdate`   | Balance change                    |

***

## markets

Connect to the markets WebSocket for real-time market data and trades.

```typescript theme={null}
const ws = client.ws.markets();

// Register event handlers
ws.on('marketData', (data) => console.log('Book:', data));
ws.on('marketDataLite', (data) => console.log('BBO:', data));
ws.on('trade', (data) => console.log('Trade:', data));

await ws.connect();

// Subscribe to market data
ws.subscribeMarketData('book', ['btc-100k-2025']);
ws.subscribeMarketDataLite('prices', ['btc-100k-2025']);
ws.subscribeTrades('trades', ['btc-100k-2025']);
```

### Market Subscription Types

| Type                                 | Description                   |
| ------------------------------------ | ----------------------------- |
| `SUBSCRIPTION_TYPE_MARKET_DATA`      | Full order book and stats     |
| `SUBSCRIPTION_TYPE_MARKET_DATA_LITE` | Lightweight price data (BBO)  |
| `SUBSCRIPTION_TYPE_TRADE`            | Real-time trade notifications |

### Market Events

| Event            | Description            |
| ---------------- | ---------------------- |
| `marketData`     | Full order book update |
| `marketDataLite` | BBO and price update   |
| `trade`          | Trade execution        |

***

## Best Practices

1. **Use unique request IDs** - Track subscriptions with unique identifiers
2. **Handle reconnection** - Implement automatic reconnection with exponential backoff
3. **Process messages in order** - Messages are delivered in sequence
4. **Limit subscriptions** - Only subscribe to markets you need
