> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# REST API Overview

> Complete guide to the Polymarket US REST API

The Polymarket US REST API provides programmatic access to trading, account management, market data, and funding operations.

<Note>
  This documentation is specific to Polymarket US. The international version can be found [here](https://docs.polymarket.com/).
</Note>

## Streaming First Architecture

<Warning>
  **Use gRPC Streaming for Real-Time Data**

  For production applications requiring continuous data updates, use the [gRPC Streaming APIs](/streaming-endpoints/grpc-overview) instead of polling REST endpoints. Streaming provides:

  * **Real-time updates** as they happen
  * **No rate limiting** concerns
  * **Lower latency** than polling
  * **Reduced infrastructure load**

  REST APIs are subject to rate limits and are best suited for one-time queries, historical data, and administrative operations.
</Warning>

| Use Case                      | Recommended API                                                    |
| ----------------------------- | ------------------------------------------------------------------ |
| Real-time market data         | [gRPC Market Data Stream](/streaming-endpoints/market-data-stream) |
| Real-time order/trade updates | [gRPC Order Stream](/streaming-endpoints/order-stream)             |
| Order entry/cancellation      | REST Trading API                                                   |
| Historical data queries       | REST Report API                                                    |
| Account management            | REST Accounts API                                                  |
| KYC and payments              | REST Partner APIs                                                  |

## Base URLs

| Environment    | Base URL                                     |
| -------------- | -------------------------------------------- |
| Pre-production | `https://api.preprod.polymarketexchange.com` |
| Production     | `https://api.prod.polymarketexchange.com`    |

All endpoints use the `/v1/` path prefix.

## Authentication

All API requests require an access token in the `Authorization` header:

```bash theme={null}
curl -X GET "https://api.preprod.polymarketexchange.com/v1/whoami" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -H "x-participant-id: firms/YourFirm/users/your-user"
```

<Warning>
  Access tokens expire every **3 minutes**. Implement automatic token refresh in your application.
</Warning>

See the [Authentication Setup Guide](/trader-guide/authentication) for complete authentication setup.

## API Groups

### Trading APIs

For direct trading operations. Used by all partners.

| Endpoint Group     | Description                                   | Streaming Alternative                                         |
| ------------------ | --------------------------------------------- | ------------------------------------------------------------- |
| **Trading**        | Insert, cancel, and replace orders            | -                                                             |
| **Combos**         | Create and retrieve combo instruments         | -                                                             |
| **RFQs**           | Create, quote, accept, and confirm combo RFQs | [RFQ Events Stream](/streaming-endpoints/rfq-events-stream)   |
| **Report**         | Search orders and trades, download history    | [Order Stream](/streaming-endpoints/order-stream)             |
| **Positions**      | Query account balances and positions          | -                                                             |
| **Reference Data** | List instruments, symbols, and metadata       | -                                                             |
| **Order Book**     | Get order book depth and best bid/offer       | [Market Data Stream](/streaming-endpoints/market-data-stream) |
| **Drop Copy**      | Execution feed and trade capture              | [Order Stream](/streaming-endpoints/order-stream)             |

### Combos and RFQ APIs

Use the [Combos API](/institutional/combos/overview) to create and retrieve combo instruments. Use the [RFQ API](/institutional/rfqs/overview) to create RFQs, quote RFQs, delete quotes, accept quotes, and confirm accepted quotes during last look. Use the [RFQ Events Stream](/streaming-endpoints/rfq-events-stream) for real-time RFQ and quote lifecycle events instead of polling `GetRFQs` and `GetQuotes`.

### Partner APIs

For partners building retail trading platforms with end-user onboarding, KYC, and payments.

<Card title="Partner Guide" icon="building" href="/partners/overview">
  Complete guide for partners including Accounts, KYC, and Payments APIs
</Card>

<Info>
  **Which APIs do I need?**

  * **Direct trading partners**: Use the Trading APIs documented in this section
  * **Retail partners**: Use Trading APIs plus the [Partner Guide](/partners/overview) APIs
</Info>

## Request Format

### Headers

| Header             | Required    | Description                                                                 |
| ------------------ | ----------- | --------------------------------------------------------------------------- |
| `Authorization`    | Yes         | `Bearer {access_token}`                                                     |
| `Content-Type`     | Yes         | `application/json`                                                          |
| `x-participant-id` | Conditional | Your participant ID (required for trading, positions, and report endpoints) |

<Note>
  **When is `x-participant-id` required?**

  * **Required** for all account-scoped endpoints: trading, positions, reports, and account operations
  * **Not required** for market data, order book, reference data, and instrument state endpoints

  Your participant ID is given to you at onboarding, or returned as `participantId` on KYC approval for an end user you onboard — send it exactly as provided rather than assembling it from another response. `GET /v1/users` lists your firm's users once you already hold a valid participant ID, but is account-scoped itself and so can't be used to find your first one. See [Finding Your Participant ID](/trader-guide/accounts-identity#finding-your-participant-id) for details.
</Note>

### Request Body

POST requests accept JSON bodies:

```json theme={null}
{
  "symbol": "tec-nfl-sbw-2026-02-08-kc",
  "side": "SIDE_BUY",
  "order_qty": 100,
  "price": 550,
  "type": "ORDER_TYPE_LIMIT",
  "time_in_force": "TIME_IN_FORCE_GOOD_TILL_CANCEL"
}
```

## Response Format

### Success Response

```json theme={null}
{
  "order": {
    "id": "ord_abc123",
    "symbol": "tec-nfl-sbw-2026-02-08-kc",
    "state": "ORDER_STATE_NEW",
    "order_qty": 100,
    "leaves_qty": 100,
    "cum_qty": 0
  }
}
```

### Error Response

```json theme={null}
{
  "code": 3,
  "message": "invalid order quantity",
  "details": []
}
```

| HTTP Status | Meaning                                 |
| ----------- | --------------------------------------- |
| `200`       | Success                                 |
| `400`       | Bad Request - Invalid parameters        |
| `401`       | Unauthorized - Invalid or expired token |
| `403`       | Forbidden - Insufficient permissions    |
| `404`       | Not Found - Resource doesn't exist      |
| `429`       | Too Many Requests - Rate limited        |
| `500`       | Internal Server Error                   |

## Price Representation

All prices are represented as `int64` values. Divide by the instrument's `price_scale` to get the decimal price:

```python theme={null}
# Get price_scale from instrument metadata
instrument = get_instrument("tec-nfl-sbw-2026-02-08-kc")
price_scale = instrument.price_scale  # e.g., 1000

# Convert API price to decimal
decimal_price = api_price / price_scale
# 550 / 1000 = 0.55 ($0.55)
```

<Info>
  Query price\_scale from the Reference Data API and cache it for each instrument.
</Info>

## Rate Limits

Order-entry endpoints use tiered per-firm, per-method limits that apply to REST and unary gRPC. Query endpoints have separate per-endpoint limits. Public (unauthenticated) endpoints are limited to **20 requests per second per IP**.

See [Rate Limits](/trader-guide/rate-limits) for the full breakdown by endpoint and protocol.

## Support

For REST API questions or issues, contact [onboarding@qcex.com](mailto:onboarding@qcex.com).

## Next Steps

<CardGroup cols={2}>
  <Card title="Quickstart Guide" icon="rocket" href="/trader-guide/quickstart">
    Place your first order in 5 minutes
  </Card>

  <Card title="Authentication" icon="key" href="/trader-guide/authentication">
    Set up Private Key JWT authentication
  </Card>

  <Card title="gRPC Streaming" icon="bolt" href="/streaming-endpoints/grpc-overview">
    Real-time market data and order updates
  </Card>

  <Card title="Environments" icon="server" href="/trader-guide/environments">
    API endpoints for dev, preprod, and prod
  </Card>
</CardGroup>
