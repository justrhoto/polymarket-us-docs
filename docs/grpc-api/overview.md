> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# gRPC API Overview

> Guide to using gRPC unary (request/response) methods on Polymarket Exchange

The Polymarket Exchange exposes all API functionality via **gRPC** using Protocol Buffers. This section covers **unary (request/response) methods** - for streaming services, see [gRPC Streaming](/streaming-endpoints/grpc-overview).

## Why Use gRPC?

gRPC offers several advantages over REST:

* **Performance**: Binary protocol with smaller payloads and faster serialization
* **Type Safety**: Strongly-typed messages defined in Protocol Buffers
* **Streaming**: Native support for bidirectional streaming (covered in gRPC Streaming tab)
* **Code Generation**: Auto-generate client libraries in any language

<Card title="Download Proto Files" icon="download" href="https://drive.google.com/uc?export=download&id=1oT9gaeBEn0vukHD9GOoj_YvzPnR3otng">
  Get the complete Protocol Buffer definitions to generate client libraries in any language
</Card>

## Server Endpoints

### Pre-Production Environment

```
grpc-api.preprod.polymarketexchange.com:443
```

### Production Environment

```
grpc-api.prod.polymarketexchange.com:443
```

<Info>
  All gRPC connections use **TLS/SSL**. Ensure your client is configured for secure connections.
</Info>

## Authentication

All gRPC calls require an access token passed in the `authorization` metadata header:

```python theme={null}
import grpc

# Obtain access token
token = get_access_token()

# Create authenticated channel
credentials = grpc.ssl_channel_credentials()
channel = grpc.secure_channel("grpc-api.prod.polymarketexchange.com:443", credentials)

# Add authorization metadata to calls
metadata = [("authorization", f"Bearer {token}")]
response = stub.GetWhoAmI(request, metadata=metadata)
```

See [Authentication](/streaming-endpoints/authentication) for details on obtaining access tokens.

## Available Services

### Trading Services

| Service           | Description                                              |
| ----------------- | -------------------------------------------------------- |
| **OrderEntryAPI** | Insert, cancel, and preview orders                       |
| **ComboAPI**      | Create and read combo instruments                        |
| **RFQAPI**        | Read and manage combo RFQs and quotes; stream RFQ events |
| **ReportAPI**     | Search orders, trades, and executions                    |
| **PositionAPI**   | Query account balances and positions                     |

### Market Data Services

| Service          | Description                             |
| ---------------- | --------------------------------------- |
| **RefDataAPI**   | List instruments, symbols, and metadata |
| **OrderBookAPI** | Get order book snapshots and BBO        |

### Account Services

| Service         | Description                  |
| --------------- | ---------------------------- |
| **AccountsAPI** | Get user info, list accounts |
| **HealthAPI**   | Health check endpoint        |

### Funding Services

| Service         | Description                                |
| --------------- | ------------------------------------------ |
| **KYCAPI**      | KYC verification status and referral codes |
| **AeropayAPI**  | ACH bank linking via Aeropay               |
| **CheckoutAPI** | Card payments via Checkout.com             |
| **FundingAPI**  | Funding accounts and transactions          |

### Execution Feed

| Service         | Description                      |
| --------------- | -------------------------------- |
| **DropCopyAPI** | Trade capture and execution feed |

***

## Drop Copy & Trade Capture gRPC Streaming

The `DropCopyAPI` service provides real-time streaming endpoints for execution reports, trade capture, and position changes. These are **gRPC streaming only** - there are no REST equivalents.

<Note>
  For complete documentation including code examples, see [DropCopy & Trade Capture Streaming](/streaming-endpoints/dropcopy-stream).
</Note>

### Available Streaming Endpoints

```protobuf theme={null}
service DropCopyAPI {
    // Real-time execution reports (fills, cancels, rejects)
    rpc CreateDropCopySubscription(CreateDropCopySubscriptionRequest)
        returns (stream CreateDropCopySubscriptionResponse);

    // Completed trade records for reconciliation
    rpc CreateTradeCaptureReportSubscription(CreateTradeCaptureReportSubscriptionRequest)
        returns (stream CreateTradeCaptureReportSubscriptionResponse);

    // Market state changes (halts, opens, closes)
    rpc CreateInstrumentStateChangeSubscription(CreateInstrumentStateChangeSubscriptionRequest)
        returns (stream CreateInstrumentStateChangeSubscriptionResponse);

    // Real-time position updates
    rpc CreatePositionChangeSubscription(CreatePositionChangeSubscriptionRequest)
        returns (stream CreatePositionChangeSubscriptionResponse);
}
```

### Drop Copy Subscription

Stream execution reports as they occur for your firm. Use this for:

* Real-time order execution monitoring
* Fill notifications across all firm accounts
* Cancel and reject tracking

**Key parameters:**

* `symbols` - Filter by specific symbols (empty = all)
* `resume_token` - Resume from previous position after disconnect

### Trade Capture Report Subscription

Stream completed trades for reconciliation and compliance. Each trade contains:

* `aggressor` - The incoming (taker) execution
* `passive` - The resting (maker) execution
* `trade_type` - Type of trade (REGULAR, CROSS, etc.)
* `state` - Trade state (NEW, CLEARED, BUSTED, ...); see [Trade States](/streaming-endpoints/dropcopy-stream#trade-states)

### Quick Example

```python theme={null}
import grpc
from polymarket.v1 import dropcopy_pb2, dropcopy_pb2_grpc

# Connect
channel = grpc.secure_channel(
    "grpc-api.prod.polymarketexchange.com:443",
    grpc.ssl_channel_credentials()
)
stub = dropcopy_pb2_grpc.DropCopyAPIStub(channel)

# Subscribe to executions
request = dropcopy_pb2.CreateDropCopySubscriptionRequest(
    symbols=["tec-nfl-sbw-2026-02-08-kc"]  # or empty for all
)
metadata = [("authorization", f"Bearer {token}")]

for response in stub.CreateDropCopySubscription(request, metadata=metadata):
    for execution in response.executions:
        print(f"Execution: {execution.id} - {execution.type}")
```

<Tip>
  **When to Use Each Stream**

  | Stream                      | Use Case                                         |
  | --------------------------- | ------------------------------------------------ |
  | **DropCopy**                | Real-time execution monitoring, trading systems  |
  | **Trade Capture Report**    | Back-office reconciliation, compliance reporting |
  | **Instrument State Change** | Trading halts, market open/close notifications   |
  | **Position Change**         | Real-time P\&L, risk monitoring                  |
</Tip>

***

## Package Structure

All services are in the `polymarket.v1` package:

```protobuf theme={null}
package polymarket.v1;

service OrderEntryAPI {
  rpc InsertOrder(InsertOrderRequest) returns (InsertOrderResponse);
  rpc CancelOrder(CancelOrderRequest) returns (CancelOrderResponse);
  rpc PreviewOrder(PreviewOrderRequest) returns (PreviewOrderResponse);
  rpc GetOpenOrders(GetOpenOrdersRequest) returns (GetOpenOrdersResponse);
}
```

## Quick Start

### 1. Install gRPC Libraries

```bash theme={null}
# Python
pip install grpcio grpcio-tools

# Go
go get google.golang.org/grpc

# Node.js
npm install @grpc/grpc-js @grpc/proto-loader
```

### 2. Obtain Proto Files

Download the proto files directly: [Polymarket - Proto Files.zip](https://drive.google.com/uc?export=download\&id=1oT9gaeBEn0vukHD9GOoj_YvzPnR3otng)

Use the downloaded definitions as the client contract. Do not make client startup depend on server reflection, whose availability can differ by environment.

### 3. Generate Client Code

```bash theme={null}
# Python example
python -m grpc_tools.protoc \
  --proto_path=./protos \
  --python_out=./gen \
  --grpc_python_out=./gen \
  ./protos/polymarket/v1/*.proto
```

### 4. Make Your First Call

```python theme={null}
import grpc
from gen.polymarket.v1 import accounts_pb2, accounts_pb2_grpc

# Connect
channel = grpc.secure_channel(
    "grpc-api.prod.polymarketexchange.com:443",
    grpc.ssl_channel_credentials()
)
stub = accounts_pb2_grpc.AccountsAPIStub(channel)

# Authenticate and call
metadata = [("authorization", f"Bearer {token}")]
response = stub.GetWhoAmI(accounts_pb2.GetWhoAmIRequest(), metadata=metadata)
print(f"User ID: {response.user_id}")
```

## REST vs gRPC

Both REST and gRPC access the same underlying services. Choose based on your needs:

| Aspect          | REST            | gRPC               |
| --------------- | --------------- | ------------------ |
| Protocol        | HTTP/JSON       | HTTP/2 + Protobuf  |
| Performance     | Good            | Better             |
| Type Safety     | Schema optional | Built-in           |
| Browser Support | Native          | Requires proxy     |
| Tooling         | curl, Postman   | grpcurl, Bloom RPC |

<Tip>
  Most integrations use **REST for simplicity** and **gRPC for performance-critical paths** like order entry.
</Tip>

## Next Steps

<CardGroup cols={2}>
  <Card title="gRPC Streaming" icon="bolt" href="/streaming-endpoints/grpc-overview">
    Real-time market data and order subscriptions
  </Card>

  <Card title="Authentication" icon="lock" href="/streaming-endpoints/authentication">
    Access token setup for gRPC
  </Card>

  <Card title="REST API" icon="code" href="/api-reference">
    Equivalent REST endpoints
  </Card>

  <Card title="Proto Reference" icon="file-code" href="/streaming-endpoints/proto-reference">
    Proto message definitions
  </Card>
</CardGroup>
