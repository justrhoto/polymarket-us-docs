> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Balance Ledger Streaming

> Real-time balance ledger entries via gRPC, with replay-from-resume_time

Subscribe to real-time balance ledger entries (deposits, withdrawals, fills, fees, adjustments) using gRPC streaming. The stream first replays any entries since `resume_time`, then pushes new entries as they happen.

For paginated historical queries and CSV exports of the same data, see the [Balance Ledger REST API](/institutional/funding/overview).

<Note>
  This stream is distinct from [Funding Transaction Streaming](/streaming-endpoints/funding-stream): that stream tracks **transaction state changes** (PENDING → COMPLETED, etc.) for deposits/withdrawals; this stream tracks the **balance impact** of every cash event in the ledger.
</Note>

## Service Definition

**Service:** `polymarket.v1.FundingAPI`
**RPC:** `CreateBalanceLedgerSubscription`
**Type:** Server-side streaming
**Required Scope:** `read:positions`

```protobuf theme={null}
service FundingAPI {
    rpc CreateBalanceLedgerSubscription(CreateBalanceLedgerSubscriptionRequest)
        returns (stream CreateBalanceLedgerSubscriptionResponse);
}
```

## Request Parameters

### CreateBalanceLedgerSubscriptionRequest

| Field         | Type                    | Required | Description                                                                                                                         |
| ------------- | ----------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `account`     | `str`                   | Yes      | Fully qualified account name. Example: `firms/ISV-Alice/accounts/alice-trading`.                                                    |
| `currency`    | `str`                   | No       | ISO currency code (e.g., `USD`). Empty = all currencies for the account.                                                            |
| `entry_types` | `list[LedgerEntryType]` | No       | Filter by one or more allowlisted entry types. Empty = all allowlisted types. Suppressed types are filtered server-side regardless. |
| `resume_time` | `Timestamp`             | No       | Replay entries with `update_time >= resume_time` before switching to live push. Clamped upstream to `2026-05-01T00:00:00Z`.         |

<Warning>
  **Cross-firm access is rejected.** The `account` must belong to the firm in the JWT `firm_id` claim. Cross-firm subscriptions return `PERMISSION_DENIED` immediately.
</Warning>

## Response Messages

The stream returns `CreateBalanceLedgerSubscriptionResponse` messages.

### CreateBalanceLedgerSubscriptionResponse

| Field     | Type                       | Description                                                                       |
| --------- | -------------------------- | --------------------------------------------------------------------------------- |
| `entries` | `list[BalanceLedgerEntry]` | Zero or more ledger entries in this batch. Empty messages function as heartbeats. |

### BalanceLedgerEntry

| Field                  | Type              | Description                                                                                                                                                                                                                                                                                                                                                    |
| ---------------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`                   | `str`             | Unique entry identifier.                                                                                                                                                                                                                                                                                                                                       |
| `account`              | `str`             | Account this entry belongs to. For IB/ISV-managed end users, this exactly matches `provisioned_account` from the [`kyc.approved` webhook](/partners/onboarding/kyc/webhooks#data-fields) and `provisionedAccount` from [KYC status](/partners/onboarding/kyc/verification-flow#check-status). Route entries to users by exact string match on `entry.account`. |
| `currency`             | `str`             | ISO currency code.                                                                                                                                                                                                                                                                                                                                             |
| `before_balance`       | `str`             | Balance immediately before this change (decimal).                                                                                                                                                                                                                                                                                                              |
| `after_balance`        | `str`             | Balance immediately after this change (decimal).                                                                                                                                                                                                                                                                                                               |
| `description`          | `str`             | Human-readable reason for the change.                                                                                                                                                                                                                                                                                                                          |
| `update_time`          | `Timestamp`       | Timestamp of the balance change. Persist for use as the next `resume_time`.                                                                                                                                                                                                                                                                                    |
| `modified_security_id` | `str`             | Security ID associated with the change, if any.                                                                                                                                                                                                                                                                                                                |
| `entry_type`           | `LedgerEntryType` | One of the allowlisted entry types (see below).                                                                                                                                                                                                                                                                                                                |
| `symbol`               | `str`             | Instrument symbol associated with the change, if any.                                                                                                                                                                                                                                                                                                          |
| `update_business_date` | `str`             | Business date in `YYYY-MM-DD`.                                                                                                                                                                                                                                                                                                                                 |

<Note>
  Firm-level omnibus and reserve account identifiers are static configuration provided during onboarding; they are not discovered through the KYC API.
</Note>

## Stream Behavior

1. **Replay phase.** On connect, the server first delivers entries with `update_time >= resume_time` (clamped to the `2026-05-01` floor). If `resume_time` is omitted, only live entries are delivered.
2. **Live phase.** After the replay drains, the server pushes new entries as they are committed.
3. **Suppressed entry types** are filtered server-side and never reach clients.
4. **Empty `entries` messages** are heartbeats and should be passed through (do not treat as termination).

## LedgerEntryType Allowlist

| Wire Value | Name                          |
| ---------- | ----------------------------- |
| `1`        | `DEPOSIT`                     |
| `2`        | `WITHDRAWAL`                  |
| `3`        | `ORDER_EXECUTION`             |
| `4`        | `CORRECTION`                  |
| `6`        | `RESOLUTION`                  |
| `7`        | `MANUAL_ADJUSTMENT`           |
| `10`       | `ACCOUNT_PROPERTY_ADJUSTMENT` |
| `11`       | `COMMISSION`                  |
| `16`       | `WITHDRAWAL_REJECTION`        |
| `17`       | `MANUAL_TRANSFER`             |
| `22`       | `PENDING_WITHDRAWAL_CREATION` |

The full allowlist plus suppressed (internal) types are documented on the [Balance Ledger REST overview](/institutional/funding/overview#ledgerentrytype).

## Stream Limits

| Limit                                                       | Value                                     |
| ----------------------------------------------------------- | ----------------------------------------- |
| Concurrent streams per firm (across all gRPC subscriptions) | **20**                                    |
| Historical floor on `resume_time`                           | `2026-05-01T00:00:00Z` (clamped upstream) |

Exceeding the per-firm concurrent stream cap returns `ResourceExhausted`.

## Metrics

The gateway exposes Prometheus metrics for balance ledger subscriptions:

| Metric                               | Type    | Labels                  | Description                                     |
| ------------------------------------ | ------- | ----------------------- | ----------------------------------------------- |
| `balance_ledger_stream_active`       | gauge   | `firm_id`               | Number of active subscriptions per firm         |
| `balance_ledger_stream_events_total` | counter | `firm_id`, `entry_type` | Total entries delivered per firm and entry type |

## Complete Python Example

```python theme={null}
import grpc
from datetime import datetime
from google.protobuf import timestamp_pb2
from polymarket.v1 import funding_pb2
from polymarket.v1 import funding_pb2_grpc


class BalanceLedgerStreamer:
    def __init__(self, grpc_server: str = "grpc-api.preprod.polymarketexchange.com:443"):
        self.grpc_server = grpc_server
        self.access_token = None
        self.last_update_time: timestamp_pb2.Timestamp | None = None  # for resume_time

    def stream_balance_ledger(
        self,
        account: str,
        currency: str = "",
        entry_types: list | None = None,
        resume_time: timestamp_pb2.Timestamp | None = None,
    ):
        """Stream balance ledger entries for one account."""
        if not self.access_token:
            raise ValueError("Not authenticated. Please login first.")

        credentials = grpc.ssl_channel_credentials()
        channel = grpc.secure_channel(self.grpc_server, credentials)
        stub = funding_pb2_grpc.FundingAPIStub(channel)

        request = funding_pb2.CreateBalanceLedgerSubscriptionRequest(
            account=account,
            currency=currency,
            entry_types=entry_types or [],
        )
        if resume_time is not None:
            request.resume_time.CopyFrom(resume_time)

        metadata = [("authorization", f"Bearer {self.access_token}")]

        try:
            print(f"Subscribing to balance ledger for {account} (currency={currency or 'ALL'})")
            response_stream = stub.CreateBalanceLedgerSubscription(
                request, metadata=metadata
            )

            for response in response_stream:
                if not response.entries:
                    continue
                for entry in response.entries:
                    self._process_entry(entry)
                    self.last_update_time = entry.update_time

        except grpc.RpcError as e:
            print(f"gRPC error: {e.code()} - {e.details()}")
            raise
        except KeyboardInterrupt:
            print("\nStream interrupted by user")
        finally:
            channel.close()

    def _process_entry(self, entry):
        ts = entry.update_time.ToDatetime().isoformat()
        entry_type_name = funding_pb2.LedgerEntryType.Name(entry.entry_type)
        delta = float(entry.after_balance) - float(entry.before_balance)
        print(
            f"[{ts}] {entry_type_name:30s} "
            f"{entry.before_balance} -> {entry.after_balance} "
            f"(delta={delta:+.2f} {entry.currency}) "
            f"{entry.description}"
        )


if __name__ == "__main__":
    streamer = BalanceLedgerStreamer()
    # streamer.access_token = "your_access_token"  # see Authentication docs

    streamer.stream_balance_ledger(
        account="firms/ISV-Alice/accounts/alice-trading",
        currency="USD",
    )
```

### Sample Output

```
Subscribing to balance ledger for firms/ISV-Alice/accounts/alice-trading (currency=USD)
[2026-05-02T14:30:15.123000] ORDER_EXECUTION                10000.00 -> 9474.03 (delta=-525.97 USD) Buy 100 @ 525 + commission
[2026-05-02T14:30:15.123000] COMMISSION                     9474.03 -> 9472.53 (delta=-1.50 USD) Maker fee
[2026-05-02T14:32:01.001000] DEPOSIT                        9472.53 -> 14472.53 (delta=+5000.00 USD) ACH deposit
```

## Reconnection Handling

Persist the most recent `update_time` so reconnections resume without gaps:

```python theme={null}
if streamer.last_update_time is not None:
    streamer.stream_balance_ledger(
        account="firms/ISV-Alice/accounts/alice-trading",
        currency="USD",
        resume_time=streamer.last_update_time,
    )
```

`resume_time` is clamped upstream to `2026-05-01T00:00:00Z`; passing an earlier value is allowed but only entries from the floor forward are replayed.

## REST vs Streaming

| Aspect         | REST `/v1/funding/balance-ledger`             | gRPC `CreateBalanceLedgerSubscription`         |
| -------------- | --------------------------------------------- | ---------------------------------------------- |
| Delivery model | Polled, paginated query                       | Push-based stream                              |
| Replay         | Via `start_time` / `end_time` + paging        | Via `resume_time` (clamped to floor)           |
| CSV export     | Yes (`/download` endpoint)                    | No                                             |
| Best for       | Reconciliation, audit reports, ad-hoc queries | Real-time balance dashboards, automated alerts |

## Error Codes

| gRPC Code             | Cause                                                                                |
| --------------------- | ------------------------------------------------------------------------------------ |
| `PERMISSION_DENIED`   | Account belongs to a different firm, or token is missing the `read:positions` scope. |
| `UNAUTHENTICATED`     | Missing or invalid JWT.                                                              |
| `FAILED_PRECONDITION` | ISV credentials not configured.                                                      |
| `UNAVAILABLE`         | Upstream exchange service not connected.                                             |
| `RESOURCE_EXHAUSTED`  | Per-firm 20 concurrent stream cap exceeded.                                          |

## Next Steps

<CardGroup cols={2}>
  <Card title="Balance Ledger REST" icon="receipt" href="/institutional/funding/overview">
    Paginated query and CSV download
  </Card>

  <Card title="Position Ledger" icon="chart-line" href="/institutional/positions/overview#position-ledger">
    Position changes (quantity, cost, realized P\&L)
  </Card>

  <Card title="Funding Transactions" icon="arrow-right-arrow-left" href="/streaming-endpoints/funding-stream">
    Deposit / withdrawal state changes
  </Card>

  <Card title="Authentication" icon="key" href="/streaming-endpoints/authentication">
    gRPC authentication setup
  </Card>
</CardGroup>
