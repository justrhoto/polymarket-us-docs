> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Positions API Overview

> Query account balances and positions

## Endpoints

| Method | Endpoint                        | Description                                                                 |
| ------ | ------------------------------- | --------------------------------------------------------------------------- |
| `GET`  | `/v1/positions`                 | Get current positions                                                       |
| `POST` | `/v1/positions/balance`         | Get single account balance                                                  |
| `POST` | `/v1/positions/balances`        | Get multiple account balances                                               |
| `GET`  | `/v1/positions/ledger`          | Query historical position changes. See [Position Ledger](#position-ledger). |
| `GET`  | `/v1/positions/ledger/download` | Download position ledger as CSV. See [Position Ledger](#position-ledger).   |

## Position Data

Each position includes:

| Field         | Description                           |
| ------------- | ------------------------------------- |
| `symbol`      | Trading instrument                    |
| `account`     | Trading account                       |
| `netPosition` | Current net position quantity         |
| `qtyBought`   | Total quantity bought                 |
| `qtySold`     | Total quantity sold                   |
| `cost`        | Total cost basis (scaled integer)     |
| `realized`    | Realized profit/loss (scaled integer) |
| `bodPosition` | Beginning-of-day position             |
| `updateTime`  | Last update timestamp                 |

## Balance Data

Account balances include:

| Field                | Description                                                                                                                                                                                           |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `balance`            | Current cash balance                                                                                                                                                                                  |
| `buyingPower`        | Available buying power for trading                                                                                                                                                                    |
| `capitalRequirement` | Required capital to maintain positions                                                                                                                                                                |
| `excessCapital`      | Capital above requirements                                                                                                                                                                            |
| `marginRequirement`  | Margin required for open positions                                                                                                                                                                    |
| `unsettledFunds`     | Funds pending settlement                                                                                                                                                                              |
| `openOrders`         | Worst-case value of open orders (see [Open Orders and Order Collateralization](/market-structure/collateral-and-margin#open-orders-and-order-collateralization) for how open orders are risk-checked) |
| `updateTime`         | Last update timestamp                                                                                                                                                                                 |

## Historical Position Queries

Query positions as they existed at a specific point in time. Useful for regulatory reporting, reconciliation, or end-of-day snapshots.

### Parameters

| Parameter    | Type              | Description                                        |
| ------------ | ----------------- | -------------------------------------------------- |
| `as_of_time` | RFC3339 timestamp | Exact point-in-time (e.g., `2026-01-02T17:00:00Z`) |
| `as_of_date` | Date object       | End-of-trading-day snapshot (year, month, day)     |

<Warning>
  **Mutually Exclusive**: Use `as_of_time` OR `as_of_date`, not both. The `as_of_time` parameter already contains date information.
</Warning>

### Examples

**Query by timestamp (exact point in time):**

```bash theme={null}
GET /v1/positions?name=firms/ISV-Alice/accounts/trading&as_of_time=2026-01-02T17:00:00Z
```

**Query by trade date (end of trading day):**

```bash theme={null}
GET /v1/positions?name=firms/ISV-Alice/accounts/trading&as_of_date.year=2026&as_of_date.month=1&as_of_date.day=2
```

### Use Cases

* **End-of-Day Reports**: Query positions at market close for daily P\&L calculations
* **Regulatory Snapshots**: Capture position state at specific regulatory timestamps
* **Reconciliation**: Compare historical positions against external records
* **Audit Trail**: Review position history for compliance or dispute resolution

## Usage Notes

<Info>
  **Position Updates After Trades**

  Position data is updated after each trade execution. For real-time trade notifications that affect positions, use the [gRPC Order Stream](/streaming-endpoints/order-stream).
</Info>

* Positions are aggregated by symbol and account
* Balances reflect current available and reserved amounts
* Use the Order Stream for real-time execution updates that affect positions
* Historical queries return the position state as of the specified time

***

## Position Ledger

The position ledger records every change to a position as a single entry, with both the **delta** (`quantityChange`, `costChange`, `realizedChange`) and the **cumulative state immediately after the change** (`netPosition`, `cost`, `realized`). Use it for reconciliation, point-in-time replay, and end-of-day reporting.

### Ledger Endpoints

| Method | Endpoint                        | gRPC                                 | Required Scope   | Description                                      |
| ------ | ------------------------------- | ------------------------------------ | ---------------- | ------------------------------------------------ |
| `GET`  | `/v1/positions/ledger`          | `PositionAPI.GetPositionLedger`      | `read:positions` | Paginated query of position ledger entries       |
| `GET`  | `/v1/positions/ledger/download` | `PositionAPI.DownloadPositionLedger` | `read:positions` | Streamed CSV download of position ledger entries |

<Note>
  Both endpoints are scoped under `read:positions` (the same scope used for `GetAccountBalance`, `ListAccountBalances`, and the position queries on this section). Calls without `read:positions` fail with `403 Forbidden` (REST) / `PERMISSION_DENIED` (gRPC).
</Note>

### Historical Floor

| Setting                 | Value                  |
| ----------------------- | ---------------------- |
| Earliest queryable date | `2026-05-01T00:00:00Z` |

The ledger has a hard historical floor of **May 1, 2026 (UTC)**. Enforcement is defense-in-depth:

1. `start_time` is **clamped upstream** to the floor when the caller asks for earlier data.
2. Entries with `update_time` before the floor are **post-filtered** from responses.

Pre-floor entries are not retrievable through this endpoint.

### Delta Computation

Each ledger entry is computed from the exchange's before/after position snapshots:

```
quantityChange = after.netPosition - before.netPosition
costChange     = after.cost        - before.cost
realizedChange = after.realized    - before.realized
```

The cumulative fields (`netPosition`, `cost`, `realized`) on each entry are the state **immediately after** the change. To reconstruct point-in-time position state, replay entries in `update_time` order.

### Cross-Firm Access

The account in `account=firms/{firm}/accounts/{id}` must belong to the caller's firm (extracted from the JWT `firm_id` claim). Cross-firm access is blocked at the gateway:

| Condition                                 | Error Code           |
| ----------------------------------------- | -------------------- |
| Account belongs to a different firm       | `PermissionDenied`   |
| JWT missing or `firm_id` absent           | `Unauthenticated`    |
| ISV credentials not configured at gateway | `FailedPrecondition` |
| Upstream exchange service unavailable     | `Unavailable`        |

### Get Position Ledger

```bash theme={null}
GET /v1/positions/ledger?account=firms/ISV-Alice/accounts/alice-trading&start_time=2026-05-01T00:00:00Z&page_size=100
```

#### Query Parameters

| Parameter      | Type    | Required | Description                                                                         |
| -------------- | ------- | -------- | ----------------------------------------------------------------------------------- |
| `account`      | string  | Yes      | Fully qualified account name. Example: `firms/ISV-Alice/accounts/alice-trading`.    |
| `symbol`       | string  | No       | Filter by instrument symbol.                                                        |
| `start_time`   | RFC3339 | No       | Inclusive lower bound on `update_time`. Clamped to `2026-05-01T00:00:00Z`.          |
| `end_time`     | RFC3339 | No       | Inclusive upper bound on `update_time`.                                             |
| `page_size`    | integer | No       | Maximum entries per page. **Max 1000**; values above 1000 return `InvalidArgument`. |
| `page_token`   | string  | No       | Pagination token from a previous response's `nextPageToken`.                        |
| `newest_first` | boolean | No       | If `true`, descending `update_time` order. Default `false`.                         |

#### Sample Response

```json theme={null}
{
  "entries": [
    {
      "id": "pl_01HXYZ...",
      "account": "firms/ISV-Alice/accounts/alice-trading",
      "symbol": "tec-nfl-sbw-2026-02-08-kc",
      "quantityChange": "50",
      "costChange": "26000",
      "realizedChange": "0",
      "netPosition": "150",
      "cost": "78000",
      "realized": "0",
      "updateTime": "2026-05-02T14:30:15.123Z",
      "updateBusinessDate": "2026-05-02",
      "description": "Trade fill"
    }
  ],
  "nextPageToken": "eyJvZmZzZXQiOjEwMH0=",
  "eof": false
}
```

#### PositionLedgerEntry Fields

| Field                | Type    | Description                                                              |
| -------------------- | ------- | ------------------------------------------------------------------------ |
| `id`                 | string  | Unique entry identifier.                                                 |
| `account`            | string  | Account this entry belongs to.                                           |
| `symbol`             | string  | Instrument symbol.                                                       |
| `quantityChange`     | int64   | Delta from previous position (`after.netPosition - before.netPosition`). |
| `costChange`         | int64   | Delta in cost basis.                                                     |
| `realizedChange`     | int64   | Delta in realized P\&L.                                                  |
| `netPosition`        | int64   | Net position **after** this change.                                      |
| `cost`               | int64   | Cost basis **after** this change.                                        |
| `realized`           | int64   | Cumulative realized P\&L **after** this change.                          |
| `updateTime`         | RFC3339 | Timestamp of the position change.                                        |
| `updateBusinessDate` | string  | Business date in `YYYY-MM-DD`.                                           |
| `description`        | string  | Human-readable reason (e.g., trade fill, expiry, correction).            |

<Note>
  **int64 fields are serialized as strings in JSON** (e.g., `"50"` not `50`) per the protobuf JSON mapping spec. Parse them as strings to avoid precision loss in languages with 53-bit integer limits.
</Note>

#### Response Wrapper Fields

| Field           | Type    | Description                                                                    |
| --------------- | ------- | ------------------------------------------------------------------------------ |
| `entries`       | array   | Position ledger entries for the requested account / time window.               |
| `nextPageToken` | string  | Pagination token to fetch the next page. Empty when there are no more results. |
| `eof`           | boolean | `true` when this response contains the final page of results.                  |

### Download Position Ledger

```bash theme={null}
GET /v1/positions/ledger/download?account=firms/ISV-Alice/accounts/alice-trading&start_time=2026-05-01T00:00:00Z
```

The download endpoint accepts the **same query parameters** as `GET /v1/positions/ledger` (`account`, `symbol`, `start_time`, `end_time`, `page_size`, `page_token`, `newest_first`).

It streams **raw CSV bytes from the upstream ledger** as a passthrough; the gateway does not parse individual rows.

<Warning>
  **CSV passthrough caveat.** Because the body is opaque to the gateway, ledger entries cannot be post-filtered row-by-row. The historical floor is still enforced upstream via `start_time` clamping, but no per-row filtering is performed on the CSV stream.
</Warning>

Empty result sets return a single empty chunk followed by EOF (HTTP 200 with an empty body). The gateway translates an upstream "stream returned a nil response" condition into an empty result.

### Ledger Rate Limits (per firm)

| Endpoint                            | Rate           | Burst | Effective    |
| ----------------------------------- | -------------- | ----- | ------------ |
| `GET /v1/positions/ledger`          | 0.5 req/sec    | 5     | \~30 req/min |
| `GET /v1/positions/ledger/download` | 0.0833 req/sec | 1     | \~5 req/min  |

Exceeding these limits returns `ResourceExhausted` (`429 Too Many Requests`).

### Ledger Error Codes

| Error                | Cause                                    |
| -------------------- | ---------------------------------------- |
| `InvalidArgument`    | Missing `account`.                       |
| `PermissionDenied`   | Account belongs to a different firm.     |
| `Unauthenticated`    | Missing JWT or `firm_id` claim.          |
| `FailedPrecondition` | ISV credentials not configured.          |
| `Unavailable`        | Upstream exchange service not connected. |
| `ResourceExhausted`  | Per-firm rate limit exceeded.            |

## See Also

<CardGroup cols={2}>
  <Card title="Balance Ledger" icon="receipt" href="/institutional/funding/overview">
    Cash balance changes (deposits, withdrawals, fills, fees)
  </Card>

  <Card title="Balance Ledger Stream" icon="bolt" href="/streaming-endpoints/balance-ledger-stream">
    Real-time balance ledger via gRPC
  </Card>

  <Card title="Order Stream" icon="list-check" href="/streaming-endpoints/order-stream">
    Real-time execution updates that affect positions
  </Card>

  <Card title="Authentication" icon="key" href="/trader-guide/authentication#api-scopes">
    Required scopes and OAuth flow
  </Card>
</CardGroup>
