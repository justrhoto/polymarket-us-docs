> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Report API Overview

> Search and export orders, trades, and executions

<Warning>
  **Prefer Streaming for Real-Time Updates**

  This polling API is subject to rate limits. For production applications that need continuous order and trade updates, use the [gRPC Order Stream](/streaming-endpoints/order-stream) instead. The streaming API provides real-time execution reports as they happen.
</Warning>

## Endpoints

| Method | Endpoint | Description |
| - | - | - |
| `POST` | `/v1/report/orders/search` | Search orders with filters |
| `POST` | `/v1/report/trades/search` | Search trades with filters |
| `POST` | `/v1/report/executions/search` | Search executions with filters |
| `POST` | `/v1/report/orders/csv` | Export orders to CSV |
| `POST` | `/v1/report/trades/csv` | Export trades to CSV |
| `POST` | `/v1/report/executions/csv` | Export executions to CSV |
| `POST` | `/v1/report/trades/stats` | Get aggregated trade statistics |

<Warning>
  **Participant context required for Trade Stats**

  `POST /v1/report/trades/stats` (`GetTradeStats`) accepts Auth0 JWT with `read:reports` at the gateway, but still requires participant context downstream (`x-participant-id` / DCM participant context). Market-data-only clients without a participant receive `401`. This route is **not supported for MD-only** access today, and there is no public/retail substitute.

  `read:reports` alone is not enough. Other report endpoints (orders search, trades search, etc.) also require participant context.
</Warning>

## When to Use

| Use Case | Recommended API |
| - | - |
| Real-time order status updates | [gRPC Order Stream](/streaming-endpoints/order-stream) |
| Real-time fill notifications | [gRPC Order Stream](/streaming-endpoints/order-stream) |
| Historical order lookup | REST Orders Search (this API) |
| End-of-day reconciliation | REST Reports Export |
| Audit and compliance reports | REST Reports Export |

<Tip>
  **Streaming First Architecture**

  For any use case requiring real-time order or trade updates, use the streaming API. Use the REST Report API only for:

  * Historical data queries
  * One-time lookups
  * Batch exports for reporting
</Tip>

## Search vs Export

* **Search endpoints** (`/v1/report/orders/search`, `/v1/report/trades/search`, `/v1/report/executions/search`): Return paginated JSON results for programmatic access
* **Export endpoints** (`/v1/report/orders/csv`, `/v1/report/trades/csv`, `/v1/report/executions/csv`): Return CSV file streams for spreadsheet analysis and reporting

## Common Filters

| Filter | Description |
| - | - |
| `symbols` | Filter by trading symbols |
| `accounts` | Filter by trading accounts |
| `startTime` / `endTime` | Date range filter |
| `states` | Order states (NEW, FILLED, CANCELED, etc.) |
| `sides` | BUY or SELL |

See the individual endpoint documentation for complete filter options.


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.