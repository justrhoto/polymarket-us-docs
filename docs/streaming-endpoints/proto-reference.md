> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Protocol Buffer Reference

> Complete reference for gRPC message definitions and Python code generation

Complete reference documentation for all Protocol Buffer messages, fields, and enumerations used in the gRPC streaming API.

## Available Services

The Polymarket Exchange API exposes the following gRPC services:

| Service                                   | Description                                      |
| ----------------------------------------- | ------------------------------------------------ |
| `polymarket.v1.MarketDataSubscriptionAPI` | Real-time market data streaming                  |
| `polymarket.v1.OrderEntryAPI`             | Order submission and streaming                   |
| `polymarket.v1.ComboAPI`                  | Combo instrument creation and exact-symbol reads |
| `polymarket.v1.RFQAPI`                    | Combo RFQs, quotes, and RFQ event streaming      |
| `polymarket.v1.OrderAPI`                  | Order search and history                         |
| `polymarket.v1.PositionAPI`               | Position and balance queries                     |
| `polymarket.v1.AccountsAPI`               | Account information                              |
| `polymarket.v1.MarketDataAPI`             | Instrument and symbol data                       |
| `polymarket.v1.DropCopyAPI`               | Execution feed                                   |
| `polymarket.v1.KYCAPI`                    | KYC verification                                 |
| `polymarket.v1.AeropayAPI`                | ACH payments                                     |
| `polymarket.v1.CheckoutAPI`               | Card payments                                    |
| `polymarket.v1.FundingAPI`                | Funding management                               |
| `polymarket.v1.HealthAPI`                 | Health check                                     |

***

## Obtaining Proto Files

<Card title="Download Proto Files" icon="download" href="https://drive.google.com/uc?export=download&id=1oT9gaeBEn0vukHD9GOoj_YvzPnR3otng">
  Get the complete Protocol Buffer definitions to generate client libraries in any language
</Card>

<Info>
  Use the downloaded definitions as the client contract. Do not make client startup depend on gRPC reflection, whose availability can differ by environment.
</Info>

***

## Generating Python Client Code

After downloading the proto files, generate Python code:

```bash theme={null}
unzip polymarket-protos.zip -d protos
python -m grpc_tools.protoc --python_out=. --grpc_python_out=. --proto_path=protos/api protos/api/polymarket/v1/*.proto protos/api/google/api/*.proto protos/api/protoc-gen-openapiv2/options/*.proto
```

This generates:

* `*_pb2.py` - Message and enum definitions
* `*_pb2_grpc.py` - Service stubs

***

## Market Data Streaming

### MarketDataSubscriptionAPI Service

```protobuf theme={null}
service MarketDataSubscriptionAPI {
    rpc CreateMarketDataSubscription(CreateMarketDataSubscriptionRequest)
        returns (stream CreateMarketDataSubscriptionResponse);
}
```

### Python Usage

```python theme={null}
from polymarket.v1 import marketdatasubscription_pb2
from polymarket.v1 import marketdatasubscription_pb2_grpc

# Create request
request = marketdatasubscription_pb2.CreateMarketDataSubscriptionRequest(
    symbols=["SYMBOL-123"],
    depth=10
)

# Use stub
stub = marketdatasubscription_pb2_grpc.MarketDataSubscriptionAPIStub(channel)
response_stream = stub.CreateMarketDataSubscription(request, metadata=metadata)
```

### Request Fields

| Field           | Type        | Description                                             |
| --------------- | ----------- | ------------------------------------------------------- |
| `symbols`       | `list[str]` | Symbols to subscribe to. Empty = all symbols.           |
| `unaggregated`  | `bool`      | If true, receive raw orders. If false, aggregated book. |
| `depth`         | `int`       | Number of price levels. Default: 10                     |
| `snapshot_only` | `bool`      | If true, receive snapshot then close.                   |

### Response Fields

```python theme={null}
if response.HasField('heartbeat'):
    # Keep-alive message
    pass
elif response.HasField('update'):
    update = response.update
    print(f"Symbol: {update.symbol}")
    print(f"Bids: {len(update.bids)}")
    print(f"Offers: {len(update.offers)}")
```

| Field    | Type              | Description                         |
| -------- | ----------------- | ----------------------------------- |
| `symbol` | `str`             | Instrument symbol                   |
| `bids`   | `list[BookEntry]` | Bid side of order book              |
| `offers` | `list[BookEntry]` | Offer/ask side of order book        |
| `state`  | `InstrumentState` | Current instrument state (optional) |
| `stats`  | `InstrumentStats` | Market statistics                   |

<Tip>
  **Instrument State Tracking:** The `state` field is optional. Use `ListInstruments` to get and cache the initial state, then subscribe to the instrument state change subscription for real-time state updates.
</Tip>

***

## Order Entry Streaming

### OrderEntryAPI Service

```protobuf theme={null}
service OrderEntryAPI {
    rpc CreateOrderSubscription(CreateOrderSubscriptionRequest)
        returns (stream CreateOrderSubscriptionResponse);

    rpc InsertOrder(InsertOrderRequest) returns (InsertOrderResponse);
    rpc CancelOrder(CancelOrderRequest) returns (CancelOrderResponse);
}
```

### Python Usage

```python theme={null}
from polymarket.v1 import trading_pb2
from polymarket.v1 import trading_pb2_grpc

# Create order subscription request
request = trading_pb2.CreateOrderSubscriptionRequest(
    symbols=["SYMBOL-123"],
    accounts=[],
    snapshot_only=False
)

# Use stub
stub = trading_pb2_grpc.OrderEntryAPIStub(channel)
response_stream = stub.CreateOrderSubscription(request, metadata=metadata)
```

### Subscription Request Fields

| Field           | Type        | Description                                      |
| --------------- | ----------- | ------------------------------------------------ |
| `symbols`       | `list[str]` | Filter by symbols. Empty = all.                  |
| `accounts`      | `list[str]` | Filter by accounts. Empty = all user's accounts. |
| `snapshot_only` | `bool`      | If true, snapshot only.                          |

### Response Processing

```python theme={null}
if response.HasField('heartbeat'):
    pass
elif response.HasField('snapshot'):
    for order in response.snapshot.orders:
        print(f"Order: {order.id} - {order.symbol}")
elif response.HasField('update'):
    for execution in response.update.executions:
        print(f"Execution: {execution.id}")
```

## RFQ Events Streaming

### ComboAPI and RFQAPI Services

```protobuf theme={null}
service ComboAPI {
    rpc CreateCombo(CreateComboRequest) returns (CreateComboResponse);
    rpc GetCombos(GetCombosRequest) returns (GetCombosResponse);
}

service RFQAPI {
    rpc GetRFQUserID(GetRFQUserIDRequest) returns (GetRFQUserIDResponse);
    rpc GetRFQs(GetRFQsRequest) returns (GetRFQsResponse);
    rpc CreateRFQ(CreateRFQRequest) returns (CreateRFQResponse);
    rpc DeleteRFQ(DeleteRFQRequest) returns (DeleteRFQResponse);
    rpc GetQuotes(GetQuotesRequest) returns (GetQuotesResponse);
    rpc CreateQuote(CreateQuoteRequest) returns (CreateQuoteResponse);
    rpc DeleteQuote(DeleteQuoteRequest) returns (DeleteQuoteResponse);
    rpc AcceptQuote(AcceptQuoteRequest) returns (AcceptQuoteResponse);
    rpc ConfirmQuote(ConfirmQuoteRequest) returns (ConfirmQuoteResponse);
    rpc StreamRFQEvents(StreamRFQEventsRequest)
        returns (stream StreamRFQEventsResponse);
}
```

### Request Fields

`StreamRFQEventsRequest` is currently empty.

### RFQ Price Tick

`RFQ` includes `optional double tick_size = 14` (JSON `tickSize`): the instrument's minimum price increment in dollars.

In Python, check `rfq.HasField("tick_size")`. If absent, use `GetCombos` with `rfq.symbol`; zero is not a valid tick.

### RFQ Combo Legs

`RFQ.combo_legs` preserves the component order and sides captured at RFQ creation:

```protobuf theme={null}
message RFQComboLeg {
    string symbol = 1;
    Side side = 2;
    optional string settlement_price = 3;
}
```

`settlement_price` is the raw YES/LONG settlement normalized to `[0,1]`. It is not inverted for SELL legs. Optional presence distinguishes an unavailable settlement from a present zero.

### Response Events

Each `StreamRFQEventsResponse` has one `event` payload:

| Event             | Description                                                                                                                                |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `rfq_created`     | A new combo RFQ was created.                                                                                                               |
| `rfq_closed`      | An RFQ closed because it was deleted or a quote was accepted. On acceptance, this public event may arrive before private `quote_accepted`. |
| `quote_created`   | A quote was created.                                                                                                                       |
| `quote_deleted`   | A quote was deleted.                                                                                                                       |
| `quote_accepted`  | One quote side was accepted and last look started.                                                                                         |
| `quote_confirmed` | The maker confirmed and paired order submission was scheduled.                                                                             |
| `quote_executed`  | Both exchange orders were accepted for submission.                                                                                         |

For request/response field detail and a Python example, see [RFQ Events Streaming](/streaming-endpoints/rfq-events-stream).

***

## Funding Streaming

### FundingAPI Service

```protobuf theme={null}
service FundingAPI {
    rpc CreateFundingTransactionSubscription(CreateFundingTransactionSubscriptionRequest)
        returns (stream CreateFundingTransactionSubscriptionResponse);

    rpc CreateBalanceLedgerSubscription(CreateBalanceLedgerSubscriptionRequest)
        returns (stream CreateBalanceLedgerSubscriptionResponse);
}
```

| RPC                                    | Description                                                | Required Scope   |
| -------------------------------------- | ---------------------------------------------------------- | ---------------- |
| `CreateFundingTransactionSubscription` | Real-time deposit / withdrawal state changes               | `read:funding`   |
| `CreateBalanceLedgerSubscription`      | Real-time balance ledger entries with `resume_time` replay | `read:positions` |

### CreateBalanceLedgerSubscriptionRequest

| Field         | Type                    | Description                                                                                    |
| ------------- | ----------------------- | ---------------------------------------------------------------------------------------------- |
| `account`     | `str`                   | Required. Fully qualified account name.                                                        |
| `currency`    | `str`                   | Optional. ISO currency code (e.g., `USD`).                                                     |
| `entry_types` | `list[LedgerEntryType]` | Optional. Filter by allowlisted entry types.                                                   |
| `resume_time` | `Timestamp`             | Optional. Replay entries with `update_time >= resume_time`. Clamped to `2026-05-01T00:00:00Z`. |

For full request/response field detail and a Python example, see [Balance Ledger Streaming](/streaming-endpoints/balance-ledger-stream).

***

## Enumerations

### Side

| Name        | Value |
| ----------- | ----- |
| `SIDE_BUY`  | 1     |
| `SIDE_SELL` | 2     |

### OrderType

| Name                         | Value |
| ---------------------------- | ----- |
| `ORDER_TYPE_MARKET_TO_LIMIT` | 1     |
| `ORDER_TYPE_LIMIT`           | 2     |
| `ORDER_TYPE_STOP`            | 3     |
| `ORDER_TYPE_STOP_LIMIT`      | 4     |

### TimeInForce

| Name                                                 | Value | Description                                |
| ---------------------------------------------------- | ----- | ------------------------------------------ |
| `TIME_IN_FORCE_DAY`                                  | 1     | Expires end of day                         |
| `TIME_IN_FORCE_GOOD_TILL_CANCEL`                     | 2     | Good-till-canceled                         |
| `TIME_IN_FORCE_IMMEDIATE_OR_CANCEL`                  | 3     | Immediate-or-cancel                        |
| `TIME_IN_FORCE_GOOD_TILL_TIME`                       | 4     | Good-till-time; set the good-til timestamp |
| `TIME_IN_FORCE_FILL_OR_KILL`                         | 5     | Fill-or-kill                               |

<Warning>
  **DAY orders do not automatically cancel at 5pm during trade day rolls.**

  The Exchange team is working on improving the DAY order types performance. While the Exchange makes improvement, DAY orders will not automatically cancel at 5pm during trade day rolls. Please use GTD orders with the desired timestamp. GTD orders will remain functional with the good-til-time specified.
</Warning>

### OrderState

| Name                                                 | Value | Description                                                             |
| ---------------------------------------------------- | ----- | ----------------------------------------------------------------------- |
| `ORDER_STATE_NEW`                                    | 0     | Accepted and resting                                                    |
| `ORDER_STATE_PARTIALLY_FILLED`                       | 1     | Partially executed, remainder still working                             |
| `ORDER_STATE_FILLED`                                 | 2     | Completely filled                                                       |
| `ORDER_STATE_CANCELED`                               | 3     | Canceled                                                                |
| `ORDER_STATE_REPLACED`                               | 4     | Replaced by a cancel/replace                                            |
| `ORDER_STATE_REJECTED`                               | 5     | Rejected                                                                |
| `ORDER_STATE_EXPIRED`                                | 6     | Expired                                                                 |
| `ORDER_STATE_PENDING_NEW`                            | 7     | Received at the exchange edge, not yet processed by the matching engine |
| `ORDER_STATE_PENDING_REPLACE`                        | 8     | Replace received at the exchange edge, not yet processed                |
| `ORDER_STATE_PENDING_CANCEL`                         | 9     | Cancel received at the exchange edge, not yet processed                 |
| `ORDER_STATE_PENDING_RISK`                           | 10    | Pending risk approval; non-terminal                                     |

### ExecutionType

| Name                                                 | Value | Description        |
| ---------------------------------------------------- | ----- | ------------------ |
| `EXECUTION_TYPE_NEW`                                 | 0     | Order confirmation |
| `EXECUTION_TYPE_PARTIAL_FILL`                        | 1     | Partial fill       |
| `EXECUTION_TYPE_FILL`                                | 2     | Complete fill      |
| `EXECUTION_TYPE_CANCELED`                            | 3     | Cancellation       |
| `EXECUTION_TYPE_REPLACE`                             | 4     | Replace            |
| `EXECUTION_TYPE_REJECTED`                            | 5     | Rejection          |
| `EXECUTION_TYPE_EXPIRED`                             | 6     | Expiration         |
| `EXECUTION_TYPE_DONE_FOR_DAY`                        | 7     | Done for day       |

### InstrumentState

#### Primary State Flow

| Name                                                 | Value | Description                                                                                                                                                                                                      |
| ---------------------------------------------------- | ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `INSTRUMENT_STATE_PENDING`                           | 8     | Initial state for a newly created instrument which has not yet begun trading.                                                                                                                                    |
| `INSTRUMENT_STATE_OPEN`                              | 1     | In this state, the instrument is open for continuous order entry and matching.                                                                                                                                   |
| `INSTRUMENT_STATE_CLOSED`                            | 0     | In this state, orders can not be entered, modified, or canceled, and no matching occurs. Any existing Day orders will be expired.                                                                                |
| `INSTRUMENT_STATE_EXPIRED`                           | 4     | An instrument moves to this state when its Expiration Date/Time is reached. In this state, any resting orders are expired and no new orders can be entered.                                                      |
| `INSTRUMENT_STATE_TERMINATED`                        | 5     | When an instrument's Termination Date is reached, the order book is removed from the matching engine, orders are canceled, and positions are closed. Historical data will still remain in Polymarket US ledgers. |

#### Exception States

| Name                                                 | Value | Description                                                                                   |
| ---------------------------------------------------- | ----- | --------------------------------------------------------------------------------------------- |
| `INSTRUMENT_STATE_SUSPENDED`                         | 3     | Orders can be canceled but no matching occurs, and no order entry or modification is allowed. |
| `INSTRUMENT_STATE_HALTED`                            | 6     | This state is similar to SUSPENDED, with the exception that orders cannot be canceled.        |

#### Other Possible States

| Name                                                 | Value | Description                                                                                                                                                                                                                                                                                       |
| ---------------------------------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `INSTRUMENT_STATE_PREOPEN`                           | 2     | Orders can be entered and modified, but no matching occurs. When the instrument transitions to an OPEN state, the orders entered during PREOPEN will match at a single opening price that is automatically determined by an algorithm that is designed to maximize the volume traded at the open. |
| `INSTRUMENT_STATE_MATCH_AND_CLOSE_AUCTION`           | 7     | This state is similar to PREOPEN, with the exception that matching will occur upon the transition of this state to any other state. This state is useful if you want matching to occur at the end of the state, but you don't want the instrument to be open after.                               |

### LedgerEntryType

Used by `CreateBalanceLedgerSubscription` and the [Balance Ledger REST endpoints](/institutional/funding/overview). Only the **allowed** values are returned to clients; suppressed values are filtered server-side.

#### Allowed

| Name                          | Value | Description                           |
| ----------------------------- | ----- | ------------------------------------- |
| `DEPOSIT`                     | 1     | Funds deposited                       |
| `WITHDRAWAL`                  | 2     | Funds withdrawn                       |
| `ORDER_EXECUTION`             | 3     | Cash impact of a trade execution      |
| `CORRECTION`                  | 4     | Manual correction                     |
| `RESOLUTION`                  | 6     | Market resolution / settlement payout |
| `MANUAL_ADJUSTMENT`           | 7     | Admin adjustment                      |
| `ACCOUNT_PROPERTY_ADJUSTMENT` | 10    | Account property change               |
| `COMMISSION`                  | 11    | Trading fee                           |
| `WITHDRAWAL_REJECTION`        | 16    | Failed withdrawal returned to balance |
| `MANUAL_TRANSFER`             | 17    | Internal transfer                     |
| `PENDING_WITHDRAWAL_CREATION` | 22    | Withdrawal initiated (funds reserved) |

#### Suppressed (internal — never returned to clients)

| Name                          | Value |
| ----------------------------- | ----- |
| `NETTING`                     | 5     |
| `SECURITY_BALANCE_ADJUSTMENT` | 8     |
| `SECURITY_MARK_TO_MARKET`     | 9     |
| `CONTRACT_EXPIRATION`         | 12    |
| `PENDING_CREDIT_ADJUSTMENT`   | 13    |
| `BEGINNING_OF_DAY`            | 14    |
| `SECURITY_WITHDRAWAL`         | 15    |
| `AVERAGE_PRICE_TRANSFER`      | 18    |
| `GIVE_UP`                     | 19    |
| `SYNCHRONIZATION`             | 20    |
| `INTEREST`                    | 21    |
| `SETTLEMENT_FEE`              | 23    |

Requesting a suppressed value in `entry_types` returns `Aborted` (HTTP `409`).

***

## Price Representation

<Warning>
  **All prices are `int64` values.** Divide by the instrument's `price_scale` to get the decimal value.

  ```python theme={null}
  decimal_price = order.price / order.price_scale
  print(f"Price: ${decimal_price:.4f}")
  ```
</Warning>

***

## Next Steps

<CardGroup cols={2}>
  <Card title="Market Data Stream" icon="chart-line" href="/streaming-endpoints/market-data-stream">
    Learn about market data streaming
  </Card>

  <Card title="Order Stream" icon="file-invoice" href="/streaming-endpoints/order-stream">
    Learn about order streaming
  </Card>

  <Card title="Error Handling" icon="triangle-exclamation" href="/streaming-endpoints/error-handling">
    Handle errors and reconnections
  </Card>
</CardGroup>
