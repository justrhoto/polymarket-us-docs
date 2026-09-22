> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Funding Overview

> Cash balance changes (deposits, withdrawals, fills, fees, adjustments)

The balance ledger records every change to an account's cash balance, with both `before_balance` / `after_balance` and a typed `entry_type` describing why the balance moved. Use it for cash reconciliation, audit trails, and regulatory reporting.

For real-time push of these same entries, see the [Balance Ledger Stream](/streaming-endpoints/balance-ledger-stream).

## Endpoints

| Method | Endpoint                              | Required Scope   | Description                                     |
| ------ | ------------------------------------- | ---------------- | ----------------------------------------------- |
| `GET`  | `/v1/funding/balance-ledger`          | `read:positions` | Paginated query of balance ledger entries       |
| `GET`  | `/v1/funding/balance-ledger/download` | `read:positions` | Streamed CSV download of balance ledger entries |

<Note>
  Balance ledger endpoints are scoped under `read:positions` (not `read:funding`) to stay consistent with the existing balance-query endpoints (`GetAccountBalance`, `ListAccountBalances`). Calls without `read:positions` fail with `403 Forbidden` (REST) / `PERMISSION_DENIED` (gRPC).
</Note>

## Historical Floor

| Setting                 | Value                  |
| ----------------------- | ---------------------- |
| Earliest queryable date | `2026-05-01T00:00:00Z` |

The ledger has a hard historical floor of **May 1, 2026 (UTC)**. Enforcement is defense-in-depth:

1. `start_time` is **clamped upstream** to the floor when the caller asks for earlier data.
2. Entries with `update_time` before the floor are **post-filtered** from JSON responses.

Pre-floor entries are not retrievable through this endpoint.

## Cross-Firm Access

The account in `account=firms/{firm}/accounts/{id}` must belong to the caller's firm (extracted from the JWT `firm_id` claim).

| Condition                                 | Error Code           |
| ----------------------------------------- | -------------------- |
| Account belongs to a different firm       | `PermissionDenied`   |
| JWT missing or `firm_id` absent           | `Unauthenticated`    |
| ISV credentials not configured at gateway | `FailedPrecondition` |
| Upstream exchange service unavailable     | `Unavailable`        |

## LedgerEntryType

The balance ledger uses a strict **allowlist** of entry types. Internal exchange types are suppressed and never reach clients.

### Allowed Types

| Wire Value | Name                          | Description                           |
| ---------- | ----------------------------- | ------------------------------------- |
| `1`        | `DEPOSIT`                     | Funds deposited into the account      |
| `2`        | `WITHDRAWAL`                  | Funds withdrawn from the account      |
| `3`        | `ORDER_EXECUTION`             | Cash impact of a trade execution      |
| `4`        | `CORRECTION`                  | Manual correction                     |
| `6`        | `RESOLUTION`                  | Market resolution / settlement payout |
| `7`        | `MANUAL_ADJUSTMENT`           | Admin adjustment                      |
| `10`       | `ACCOUNT_PROPERTY_ADJUSTMENT` | Account property change               |
| `11`       | `COMMISSION`                  | Trading fee                           |
| `16`       | `WITHDRAWAL_REJECTION`        | Failed withdrawal returned to balance |
| `17`       | `MANUAL_TRANSFER`             | Internal transfer between accounts    |
| `22`       | `PENDING_WITHDRAWAL_CREATION` | Withdrawal initiated (funds reserved) |

### Suppressed Types

These Internal types are blocked at the gateway and are never returned to clients.

| Wire Value | Name                          | Reason   |
| ---------- | ----------------------------- | -------- |
| `5`        | `NETTING`                     | Internal |
| `8`        | `SECURITY_BALANCE_ADJUSTMENT` | Internal |
| `9`        | `SECURITY_MARK_TO_MARKET`     | Internal |
| `12`       | `CONTRACT_EXPIRATION`         | Internal |
| `13`       | `PENDING_CREDIT_ADJUSTMENT`   | Internal |
| `14`       | `BEGINNING_OF_DAY`            | Internal |
| `15`       | `SECURITY_WITHDRAWAL`         | Internal |
| `18`       | `AVERAGE_PRICE_TRANSFER`      | Internal |
| `19`       | `GIVE_UP`                     | Internal |
| `20`       | `SYNCHRONIZATION`             | Internal |
| `21`       | `INTEREST`                    | Internal |
| `23`       | `SETTLEMENT_FEE`              | Internal |

### Enforcement

| Surface                                                       | Behavior                                                                                                                                                    |
| ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Request validation** (any endpoint)                         | Requesting a suppressed type in `entry_types` returns `Aborted` (HTTP `409`).                                                                               |
| **JSON responses** (`GET /v1/funding/balance-ledger`)         | Suppressed types in upstream responses are silently dropped.                                                                                                |
| **CSV downloads** (`GET /v1/funding/balance-ledger/download`) | When `entry_types` is empty, the gateway substitutes the **full allowlist** before forwarding upstream so suppressed types do not leak in opaque CSV bytes. |

## Get Balance Ledger

```bash theme={null}
GET /v1/funding/balance-ledger?account=firms/ISV-Alice/accounts/alice-trading&currency=USD&start_time=2026-05-01T00:00:00Z&page_size=100
```

### Query Parameters

| Parameter      | Type      | Required | Description                                                                                                                          |
| -------------- | --------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `account`      | string    | Yes      | Fully qualified account name.                                                                                                        |
| `currency`     | string    | No       | ISO currency code (e.g., `USD`). Omit for all currencies on the account.                                                             |
| `start_time`   | RFC3339   | No       | Inclusive lower bound on `update_time`. Clamped to `2026-05-01T00:00:00Z`.                                                           |
| `end_time`     | RFC3339   | No       | Inclusive upper bound on `update_time`.                                                                                              |
| `entry_types`  | string\[] | No       | Filter by one or more allowlist types. Suppressed types return `Aborted` (409).                                                      |
| `symbol`       | string    | No       | Filter by instrument symbol.                                                                                                         |
| `description`  | string    | No       | Substring filter on the entry `description`. **Maximum 200 Unicode characters (not bytes)**; longer values return `InvalidArgument`. |
| `newest_first` | boolean   | No       | If `true`, descending `update_time` order. Default `false`.                                                                          |
| `page_size`    | integer   | No       | Maximum entries per page. **Max 1000**; values above 1000 return `InvalidArgument`.                                                  |
| `page_token`   | string    | No       | Pagination token from a previous response's `nextPageToken`.                                                                         |

### Sample Response

```json theme={null}
{
  "entries": [
    {
      "id": "bl_01HXYZ...",
      "account": "firms/ISV-Alice/accounts/alice-trading",
      "currency": "USD",
      "beforeBalance": "10000.00",
      "afterBalance": "9474.03",
      "description": "Buy 100 @ 525 + commission",
      "updateTime": "2026-05-02T14:30:15.123Z",
      "modifiedSecurityId": "sec_8129",
      "entryType": "ORDER_EXECUTION",
      "symbol": "tec-nfl-sbw-2026-02-08-kc",
      "updateBusinessDate": "2026-05-02"
    },
    {
      "id": "bl_01HXYW...",
      "account": "firms/ISV-Alice/accounts/alice-trading",
      "currency": "USD",
      "beforeBalance": "9474.03",
      "afterBalance": "9472.53",
      "description": "Maker fee",
      "updateTime": "2026-05-02T14:30:15.123Z",
      "entryType": "COMMISSION",
      "symbol": "tec-nfl-sbw-2026-02-08-kc",
      "updateBusinessDate": "2026-05-02"
    }
  ],
  "nextPageToken": "eyJvZmZzZXQiOjEwMH0=",
  "eof": false
}
```

### BalanceLedgerEntry Fields

| Field                | Type              | Description                                           |
| -------------------- | ----------------- | ----------------------------------------------------- |
| `id`                 | string            | Unique entry identifier.                              |
| `account`            | string            | Account this entry belongs to.                        |
| `currency`           | string            | ISO currency code.                                    |
| `beforeBalance`      | string            | Balance immediately before this change (decimal).     |
| `afterBalance`       | string            | Balance immediately after this change (decimal).      |
| `description`        | string            | Human-readable reason for the change.                 |
| `updateTime`         | RFC3339           | Timestamp of the change.                              |
| `modifiedSecurityId` | string            | Security ID associated with the change, if any.       |
| `entryType`          | `LedgerEntryType` | One of the allowlisted entry types.                   |
| `symbol`             | string            | Instrument symbol associated with the change, if any. |
| `updateBusinessDate` | string            | Business date in `YYYY-MM-DD`.                        |

## Download Balance Ledger

```bash theme={null}
GET /v1/funding/balance-ledger/download?account=firms/ISV-Alice/accounts/alice-trading&currency=USD&start_time=2026-05-01T00:00:00Z
```

The download endpoint streams **raw CSV bytes** from the upstream ledger as a passthrough.

<Warning>
  **CSV passthrough caveat.** Because the body is opaque to the gateway, individual rows cannot be post-filtered. To prevent suppressed types from leaking in CSV bytes, the gateway substitutes the **full allowlist** for `entry_types` upstream when the caller leaves it empty.
</Warning>

Empty result sets return a single empty chunk followed by EOF (HTTP 200 with an empty body).

## Rate Limits (per firm)

| Endpoint                                  | Rate           | Burst | Effective    |
| ----------------------------------------- | -------------- | ----- | ------------ |
| `GET /v1/funding/balance-ledger`          | 0.5 req/sec    | 5     | \~30 req/min |
| `GET /v1/funding/balance-ledger/download` | 0.0833 req/sec | 1     | \~5 req/min  |

Exceeding these limits returns `ResourceExhausted` (`429 Too Many Requests`).

## Error Codes

| Error                | Cause                                                                   |
| -------------------- | ----------------------------------------------------------------------- |
| `InvalidArgument`    | Missing `account`, or `description` longer than 200 Unicode characters. |
| `Aborted` (409)      | Requested a suppressed `entry_types` value.                             |
| `PermissionDenied`   | Account belongs to a different firm.                                    |
| `Unauthenticated`    | Missing JWT or `firm_id` claim.                                         |
| `FailedPrecondition` | ISV credentials not configured.                                         |
| `Unavailable`        | Upstream exchange service not connected.                                |
| `ResourceExhausted`  | Per-firm rate limit exceeded.                                           |

## See Also

<CardGroup cols={2}>
  <Card title="Balance Ledger Stream" icon="bolt" href="/streaming-endpoints/balance-ledger-stream">
    Real-time gRPC subscription for balance ledger entries
  </Card>

  <Card title="Position Ledger" icon="chart-line" href="/institutional/positions/overview#position-ledger">
    Position changes (quantity, cost, realized P\&L)
  </Card>

  <Card title="Funding Transactions" icon="arrow-right-arrow-left" href="/streaming-endpoints/funding-stream">
    Deposit / withdrawal state changes
  </Card>

  <Card title="Authentication" icon="key" href="/trader-guide/authentication#api-scopes">
    Required scopes and OAuth flow
  </Card>
</CardGroup>
