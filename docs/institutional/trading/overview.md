> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Trading API Overview

> Insert, cancel, and manage orders

## Endpoints

### Order Entry

| Method | Endpoint                     | Description                     |
| ------ | ---------------------------- | ------------------------------- |
| `POST` | `/v1/trading/orders`         | Insert a single order           |
| `POST` | `/v1/trading/orders/list`    | Insert multiple orders (batch)  |
| `POST` | `/v1/trading/orders/preview` | Preview order before submission |

### Order Modification

| Method | Endpoint                          | Description                            |
| ------ | --------------------------------- | -------------------------------------- |
| `POST` | `/v1/trading/orders/replace`      | Replace/modify a single order          |
| `POST` | `/v1/trading/orders/replace/list` | Replace/modify multiple orders (batch) |

### Order Cancellation

| Method | Endpoint                         | Description                    |
| ------ | -------------------------------- | ------------------------------ |
| `POST` | `/v1/trading/orders/cancel`      | Cancel a single order          |
| `POST` | `/v1/trading/orders/cancel/list` | Cancel multiple orders (batch) |

### Order Query

| Method | Endpoint                  | Description     |
| ------ | ------------------------- | --------------- |
| `GET`  | `/v1/trading/orders/open` | Get open orders |

## Order Types

| Type              | Description                         |
| ----------------- | ----------------------------------- |
| `LIMIT`           | Limit order at specified price      |
| `MARKET_TO_LIMIT` | Market order that converts to limit |
| `STOP`            | Stop order                          |
| `STOP_LIMIT`      | Stop-limit order                    |

## Order Lifecycle

Orders progress through these states:

```
NEW → PARTIALLY_FILLED → FILLED
         ↓
      CANCELED
```

<Tip>
  **Real-Time Order Updates**

  After submitting orders via REST, use the [gRPC Order Stream](/streaming-endpoints/order-stream) to receive real-time updates on order status, fills, and cancellations. This is more efficient than polling for order status.
</Tip>

## Time in Force

| TIF   | Description              |
| ----- | ------------------------ |
| `DAY` | Good for the trading day |
| `GTC` | Good till canceled       |
| `IOC` | Immediate or cancel      |
| `FOK` | Fill or kill             |

<Warning>
  **DAY orders do not automatically cancel at 5pm during trade day rolls.**

  The Exchange team is working on improving the DAY order types performance. While the Exchange makes improvement, DAY orders will not automatically cancel at 5pm during trade day rolls. Please use GTD orders with the desired timestamp. GTD orders will remain functional with the good-til-time specified.
</Warning>

## Best Practices

1. **Use Order Stream for updates** - Don't poll for order status; use streaming
2. **Include client order ID** - Use `clOrdId` for your own order tracking
3. **Preview before submit** - Use the preview endpoint for order validation
4. **Handle rejects** - Implement proper error handling for rejected orders
