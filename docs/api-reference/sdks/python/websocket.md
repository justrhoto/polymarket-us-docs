> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# WebSocket

> Real-time streaming data

<Note>WebSocket is async-only. Use `asyncio.run()` or `AsyncPolymarketUS`.</Note>

The WebSocket resource provides real-time streaming data for market information and private user data.

## Methods

| Method      | Endpoint                                | Description                        |
| ----------- | --------------------------------------- | ---------------------------------- |
| `private()` | `wss://api.polymarket.us/v1/ws/private` | Orders, positions, balance updates |
| `markets()` | `wss://api.polymarket.us/v1/ws/markets` | Market data and trades             |

***

## private

Connect to the private WebSocket for real-time order, position, and balance updates.

```python theme={null}
import asyncio
from polymarket_us import PolymarketUS

async def main():
    client = PolymarketUS(
        key_id="your-key-id",
        secret_key="your-secret-key",
    )

    ws = client.ws.private()

    # Register event handlers
    ws.on("order_snapshot", lambda d: print(f"Orders: {d}"))
    ws.on("order_update", lambda d: print(f"Order update: {d}"))
    ws.on("position_snapshot", lambda d: print(f"Positions: {d}"))
    ws.on("position_update", lambda d: print(f"Position update: {d}"))
    ws.on("account_balance_snapshot", lambda d: print(f"Balance: {d}"))
    ws.on("error", lambda e: print(f"Error: {e}"))

    await ws.connect()
    
    # Subscribe to order updates
    await ws.subscribe("my-orders", "SUBSCRIPTION_TYPE_ORDER")
    
    # Subscribe to position updates
    await ws.subscribe("my-positions", "SUBSCRIPTION_TYPE_POSITION")
    
    # Subscribe to balance updates
    await ws.subscribe("my-balance", "SUBSCRIPTION_TYPE_ACCOUNT_BALANCE")

    await asyncio.sleep(3600)
    await ws.close()

asyncio.run(main())
```

### Private Subscription Types

| Type                                | Description                 |
| ----------------------------------- | --------------------------- |
| `SUBSCRIPTION_TYPE_ORDER`           | Order updates and snapshots |
| `SUBSCRIPTION_TYPE_POSITION`        | Position changes            |
| `SUBSCRIPTION_TYPE_ACCOUNT_BALANCE` | Balance updates             |

### Private Events

| Event                      | Description                       |
| -------------------------- | --------------------------------- |
| `order_snapshot`           | Initial snapshot of all orders    |
| `order_update`             | Order state change                |
| `position_snapshot`        | Initial snapshot of all positions |
| `position_update`          | Position change                   |
| `account_balance_snapshot` | Initial balance snapshot          |
| `account_balance_update`   | Balance change                    |

***

## markets

Connect to the markets WebSocket for real-time market data and trades.

```python theme={null}
import asyncio
from polymarket_us import PolymarketUS

async def main():
    client = PolymarketUS(
        key_id="your-key-id",
        secret_key="your-secret-key",
    )

    ws = client.ws.markets()

    # Register event handlers
    ws.on("market_data", lambda d: print(f"Book: {d}"))
    ws.on("market_data_lite", lambda d: print(f"BBO: {d}"))
    ws.on("trade", lambda d: print(f"Trade: {d}"))

    await ws.connect()
    
    # Subscribe to full order book updates
    await ws.subscribe("book", "SUBSCRIPTION_TYPE_MARKET_DATA", ["btc-100k-2025"])
    
    # Subscribe to lightweight price updates
    await ws.subscribe("prices", "SUBSCRIPTION_TYPE_MARKET_DATA_LITE", ["btc-100k-2025"])
    
    # Subscribe to trade notifications
    await ws.subscribe("trades", "SUBSCRIPTION_TYPE_TRADE", ["btc-100k-2025"])

    await asyncio.sleep(3600)
    await ws.close()

asyncio.run(main())
```

### Market Subscription Types

| Type                                 | Description                   |
| ------------------------------------ | ----------------------------- |
| `SUBSCRIPTION_TYPE_MARKET_DATA`      | Full order book and stats     |
| `SUBSCRIPTION_TYPE_MARKET_DATA_LITE` | Lightweight price data (BBO)  |
| `SUBSCRIPTION_TYPE_TRADE`            | Real-time trade notifications |

### Market Events

| Event              | Description            |
| ------------------ | ---------------------- |
| `market_data`      | Full order book update |
| `market_data_lite` | BBO and price update   |
| `trade`            | Trade execution        |

***

## Best Practices

1. **Use unique request IDs** - Track subscriptions with unique identifiers
2. **Handle reconnection** - Implement automatic reconnection with exponential backoff
3. **Process messages in order** - Messages are delivered in sequence
4. **Limit subscriptions** - Only subscribe to markets you need
