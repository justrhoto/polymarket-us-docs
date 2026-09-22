> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Funding Transaction Streaming

> Real-time funding transaction state changes via gRPC

Subscribe to real-time funding transaction state changes (deposits, withdrawals) using gRPC streaming. This is the **recommended approach** for monitoring funding status.

<Warning>
  **Rate Limiting Notice**

  The REST endpoint `GET /v1/funding/transactions` is rate limited. For real-time funding status updates, **prefer the gRPC streaming connection** to avoid rate limit issues and reduce latency.
</Warning>

## Service Definition

**Service:** `polymarket.v1.FundingAPI`
**RPC:** `CreateFundingTransactionSubscription`
**Type:** Server-side streaming

```protobuf theme={null}
service FundingAPI {
    rpc CreateFundingTransactionSubscription(CreateFundingTransactionSubscriptionRequest)
        returns (stream CreateFundingTransactionSubscriptionResponse);
}
```

## Request Parameters

### CreateFundingTransactionSubscriptionRequest

| Field               | Type                           | Required | Description                                                     |
| ------------------- | ------------------------------ | -------- | --------------------------------------------------------------- |
| `account_ids`       | `list[str]`                    | No       | Filter by funding account IDs. Empty = all authorized accounts. |
| `transaction_types` | `list[FundingTransactionType]` | No       | Filter by transaction type. Empty = all types.                  |
| `resume_time`       | `Timestamp`                    | No       | Resume from a previous position for reconnection.               |

### Example Request

```python theme={null}
from polymarket.v1 import funding_pb2

# Subscribe to all funding transactions for your accounts
request = funding_pb2.CreateFundingTransactionSubscriptionRequest(
    account_ids=[],
    transaction_types=[]
)

# Subscribe to deposits only
request = funding_pb2.CreateFundingTransactionSubscriptionRequest(
    account_ids=[],
    transaction_types=[funding_pb2.TRANSACTION_TYPE_DEPOSIT]
)

# Subscribe to specific account
request = funding_pb2.CreateFundingTransactionSubscriptionRequest(
    account_ids=["your-account-id"],
    transaction_types=[]
)
```

## Response Messages

The stream returns `CreateFundingTransactionSubscriptionResponse` messages when transaction states change.

### Response Fields

| Field         | Type                             | Description                                                |
| ------------- | -------------------------------- | ---------------------------------------------------------- |
| `changes`     | `list[FundingTransactionChange]` | Transaction state changes in this batch                    |
| `server_time` | `Timestamp`                      | Server timestamp (store for `resume_time` on reconnection) |

### FundingTransactionChange

| Field            | Type                      | Description                                |
| ---------------- | ------------------------- | ------------------------------------------ |
| `transaction`    | `FundingTransaction`      | The updated transaction with current state |
| `previous_state` | `FundingTransactionState` | The state before this change               |
| `change_time`    | `Timestamp`               | When this change was detected              |

## Transaction States

| State                                  | Value | Description                                  |
| -------------------------------------- | ----- | -------------------------------------------- |
| `TRANSACTION_STATE_PENDING`            | 0     | Transaction initiated, awaiting processing   |
| `TRANSACTION_STATE_PROCESSING`         | 9     | Transaction being processed                  |
| `TRANSACTION_STATE_ACKNOWLEDGED`       | 1     | Transaction acknowledged by payment provider |
| `TRANSACTION_STATE_COMPLETED`          | 2     | **Transaction successfully completed**       |
| `TRANSACTION_STATE_CANCELLED`          | 3     | Transaction cancelled                        |
| `TRANSACTION_STATE_ALLOCATED`          | 4     | Funds allocated                              |
| `TRANSACTION_STATE_REFUNDED`           | 6     | Transaction fully refunded                   |
| `TRANSACTION_STATE_PARTIALLY_REFUNDED` | 5     | Transaction partially refunded               |
| `TRANSACTION_STATE_RELEASED`           | 8     | Funds released                               |
| `TRANSACTION_STATE_PARTIALLY_RELEASED` | 7     | Funds partially released                     |

### Common State Transitions

```
Deposit Flow:
PENDING → PROCESSING → ACKNOWLEDGED → COMPLETED

Deposit Failure:
PENDING → PROCESSING → CANCELLED

Withdrawal Flow:
PENDING → PROCESSING → COMPLETED

Refund Flow:
COMPLETED → PARTIALLY_REFUNDED → REFUNDED
```

## Transaction Types

| Type                                 | Value | Description             |
| ------------------------------------ | ----- | ----------------------- |
| `TRANSACTION_TYPE_DEPOSIT`           | 1     | Deposit into account    |
| `TRANSACTION_TYPE_WITHDRAWAL`        | 2     | Withdrawal from account |
| `TRANSACTION_TYPE_TRANSFER`          | 3     | Internal transfer       |
| `TRANSACTION_TYPE_MANUAL_ADJUSTMENT` | 4     | Manual adjustment       |
| `TRANSACTION_TYPE_SETTLEMENT_FEE`    | 5     | Settlement fee          |
| `TRANSACTION_TYPE_EXECUTION_FEE`     | 7     | Trading execution fee   |

## Complete Example

```python theme={null}
import grpc
from datetime import datetime
from polymarket.v1 import funding_pb2
from polymarket.v1 import funding_pb2_grpc


class FundingTransactionStreamer:
    def __init__(self, grpc_server: str = "grpc-api.preprod.polymarketexchange.com:443"):
        self.grpc_server = grpc_server
        self.access_token = None
        self.last_server_time = None  # For resume capability

    def stream_funding_transactions(self, account_ids: list = None,
                                     transaction_types: list = None,
                                     resume_time=None):
        """Stream funding transaction state changes."""
        if not self.access_token:
            raise ValueError("Not authenticated. Please login first.")

        # Create credentials and channel
        credentials = grpc.ssl_channel_credentials()
        channel = grpc.secure_channel(self.grpc_server, credentials)
        stub = funding_pb2_grpc.FundingAPIStub(channel)

        # Create request
        request = funding_pb2.CreateFundingTransactionSubscriptionRequest(
            account_ids=account_ids or [],
            transaction_types=transaction_types or []
        )

        # Add resume_time if reconnecting
        if resume_time:
            request.resume_time.CopyFrom(resume_time)

        # Set up metadata with authorization
        metadata = [('authorization', f'Bearer {self.access_token}')]

        try:
            print("Starting funding transaction stream...")
            print(f"Account filters: {account_ids or 'ALL'}")
            print(f"Type filters: {transaction_types or 'ALL'}")
            print("-" * 60)

            response_stream = stub.CreateFundingTransactionSubscription(
                request, metadata=metadata
            )

            for response in response_stream:
                self._process_response(response)

        except grpc.RpcError as e:
            print(f"gRPC error: {e.code()} - {e.details()}")
            raise
        except KeyboardInterrupt:
            print("\nStream interrupted by user")
        finally:
            channel.close()

    def _process_response(self, response):
        """Process funding transaction change response."""
        # Store server_time for resume capability
        if response.HasField('server_time'):
            self.last_server_time = response.server_time

        for change in response.changes:
            tx = change.transaction
            print(f"\n[{datetime.now().strftime('%H:%M:%S')}] Transaction State Change")
            print(f"  Transaction ID: {tx.transaction_id}")
            print(f"  Type: {funding_pb2.FundingTransactionType.Name(tx.transaction_type)}")
            print(f"  Amount: {tx.amount} {tx.currency}")
            print(f"  Previous State: {funding_pb2.FundingTransactionState.Name(change.previous_state)}")
            print(f"  Current State: {funding_pb2.FundingTransactionState.Name(tx.transaction_state)}")
            print(f"  Account ID: {tx.account_id}")

            if tx.after_balance:
                print(f"  New Balance: {tx.after_balance}")

            print("-" * 60)


# Usage
if __name__ == "__main__":
    streamer = FundingTransactionStreamer()

    # Authenticate first (see Authentication docs)
    # streamer.access_token = "your_access_token"

    # Stream all funding transactions
    streamer.stream_funding_transactions()

    # Or filter by type
    streamer.stream_funding_transactions(
        transaction_types=[funding_pb2.TRANSACTION_TYPE_DEPOSIT]
    )
```

### Sample Output

```
Starting funding transaction stream...
Account filters: ALL
Type filters: ALL
------------------------------------------------------------

[14:30:15] Transaction State Change
  Transaction ID: tx_abc123
  Type: TRANSACTION_TYPE_DEPOSIT
  Amount: 100.00 USD
  Previous State: TRANSACTION_STATE_PENDING
  Current State: TRANSACTION_STATE_PROCESSING
  Account ID: acct_xyz789
------------------------------------------------------------

[14:30:45] Transaction State Change
  Transaction ID: tx_abc123
  Type: TRANSACTION_TYPE_DEPOSIT
  Amount: 100.00 USD
  Previous State: TRANSACTION_STATE_PROCESSING
  Current State: TRANSACTION_STATE_COMPLETED
  Account ID: acct_xyz789
  New Balance: 250.00
------------------------------------------------------------
```

## Reconnection Handling

Store the `server_time` from each response to enable seamless reconnection:

```python theme={null}
# On disconnect, reconnect with resume_time
if streamer.last_server_time:
    streamer.stream_funding_transactions(
        resume_time=streamer.last_server_time
    )
```

<Note>
  The server polls for transaction changes every 15 seconds. State changes are broadcast to subscribers as they are detected.
</Note>

## Comparing REST vs Streaming

| Aspect            | REST (`/v1/funding/transactions`) | gRPC Streaming                   |
| ----------------- | --------------------------------- | -------------------------------- |
| **Rate Limiting** | Yes - subject to rate limits      | No - single connection           |
| **Latency**       | Poll-based, higher latency        | Real-time push (\~15s detection) |
| **Efficiency**    | Multiple requests needed          | Single persistent connection     |
| **Use Case**      | One-time queries, historical data | Real-time monitoring             |

<Warning>
  **Recommendation:** Use the gRPC streaming endpoint for monitoring deposit/withdrawal status. Reserve the REST endpoint for one-time queries or fetching historical transaction data.
</Warning>

## Next Steps

<CardGroup cols={2}>
  <Card title="Balance Ledger Stream" icon="receipt" href="/streaming-endpoints/balance-ledger-stream">
    Stream every cash balance change (fills, fees, deposits, ...)
  </Card>

  <Card title="Order Stream" icon="list-check" href="/streaming-endpoints/order-stream">
    Stream real-time order updates
  </Card>

  <Card title="Market Data Stream" icon="chart-line" href="/streaming-endpoints/market-data-stream">
    Stream real-time market data
  </Card>

  <Card title="Error Handling" icon="triangle-exclamation" href="/streaming-endpoints/error-handling">
    Handle errors and reconnections
  </Card>

  <Card title="Authentication" icon="key" href="/streaming-endpoints/authentication">
    gRPC authentication setup
  </Card>
</CardGroup>
