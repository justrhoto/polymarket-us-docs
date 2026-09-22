> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# RFQ Events Streaming

> Live combo RFQ and quote events through RFQAPI

<Info>
  Read the [Combos guide](/trader-guide/combos) before integrating. It explains quote construction, visibility, last look, and recovery.
</Info>

`StreamRFQEvents` is a gRPC server-side stream for live combo RFQ and quote changes.

## Service Definition

* **Service:** `polymarket.v1.RFQAPI`
* **RPC:** `StreamRFQEvents`
* **Type:** Server-side streaming
* **Required scope:** `read:orders`

```protobuf theme={null}
service RFQAPI {
    rpc StreamRFQEvents(StreamRFQEventsRequest)
        returns (stream StreamRFQEventsResponse);
}
```

The request is empty and exposes no filters:

```python theme={null}
from polymarket.v1 import rfq_pb2

request = rfq_pb2.StreamRFQEventsRequest()
```

`StreamRFQEvents` is gRPC-only. REST and unary gRPC operations are documented in the [RFQ API Overview](/institutional/rfqs/overview).

## Rate Limit

Each firm can open one new `StreamRFQEvents` connection per second, with one open attempt of burst capacity. The limit is checked only when the stream opens; it does not throttle server-pushed events on an established stream. Reconnect with backoff after a disconnect.

## Events

Each response contains exactly one event payload.

| Event             | Payload               | Visibility                           | Description                                                   |
| ----------------- | --------------------- | ------------------------------------ | ------------------------------------------------------------- |
| `rfq_created`     | `RFQCreatedEvent`     | Public                               | A new RFQ is open.                                            |
| `rfq_closed`      | `RFQClosedEvent`      | Public                               | An RFQ closed because it was deleted or a quote was accepted. |
| `quote_created`   | `QuoteCreatedEvent`   | Requester and quote creator          | A quote was created or replaced.                              |
| `quote_deleted`   | `QuoteDeletedEvent`   | Requester and quote creator          | A quote was deleted or declined.                              |
| `quote_accepted`  | `QuoteAcceptedEvent`  | Requester and selected quote creator | The requester accepted one side and last look started.        |
| `quote_confirmed` | `QuoteConfirmedEvent` | Requester and selected quote creator | The maker confirmed and paired submission was scheduled.      |
| `quote_executed`  | `QuoteExecutedEvent`  | Requester and selected quote creator | Both exchange orders were accepted for submission.            |

Successful quote acceptance produces both events: public `rfq_closed` and participant-private `quote_accepted`. A client may receive `rfq_closed` first. Treat it as "stop quoting this RFQ," not "no quote was accepted." Keep existing quote state until the private quote event arrives, or reconcile it with `GetQuotes`.

The current public stream does not emit expiration, done-away, pending-risk, pending-end-trade, action-rejected, or status-rejected events.

## Core Payloads

### RFQ

| Field              | Type                   | Description                                                      |
| ------------------ | ---------------------- | ---------------------------------------------------------------- |
| `id`               | string                 | RFQ ID.                                                          |
| `qtyDecimal`       | optional string        | Fixed contract quantity. Mutually exclusive with `cashOrderQty`. |
| `cashOrderQty`     | optional string        | Cash notional. Mutually exclusive with `qtyDecimal`.             |
| `symbol`           | string                 | Combo symbol.                                                    |
| `rfqCreatorUserId` | string                 | Pseudonymous requester identity.                                 |
| `createdTime`      | `Timestamp`            | Creation time.                                                   |
| `restRemainder`    | bool                   | Whether an unfilled requester remainder may rest.                |
| `status`           | `RFQStatus`            | `RFQ_STATUS_OPEN` or `RFQ_STATUS_CLOSED`.                        |
| `updatedTime`      | `Timestamp`            | Last durable state change.                                       |
| `comboLegs`        | repeated `RFQComboLeg` | Ordered combo legs captured when the RFQ was created.            |
| `tickSize`         | optional double        | Minimum price increment in dollars. Protobuf: `tick_size`.       |

Each `RFQComboLeg` contains `symbol`, `side`, and an optional `settlementPrice`. The settlement is the raw YES/LONG price normalized to `[0,1]`; it is never inverted for a `SIDE_SELL` leg. Presence matters: `"0"` is a valid settled price, while an absent field means no valid settlement was available when the event was published.

`rfq_created` includes settlement prices available at creation. The stream does not emit a separate event when a leg later settles; use `GetRFQs` during reconciliation to obtain the latest available settlement projection. Historical RFQs can have no `comboLegs`.

Quote prices must be multiples of `tickSize` and within the instrument's price limits. If `tickSize` is absent, use `GetCombos` with `rfq.symbol`.

### Quote

| Field                  | Type            | Description                                             |
| ---------------------- | --------------- | ------------------------------------------------------- |
| `id`                   | string          | Quote ID.                                               |
| `rfqId`                | string          | Parent RFQ ID.                                          |
| `creatorRfqUserId`     | string          | Pseudonymous quote creator identity.                    |
| `symbol`               | string          | Combo symbol.                                           |
| `status`               | `QuoteStatus`   | Current quote state.                                    |
| `createdTime`          | `Timestamp`     | Original quote creation time.                           |
| `buyPrice`             | string          | Requester-buy price; maker sells.                       |
| `sellPrice`            | string          | Requester-sell price; maker buys.                       |
| `restRemainder`        | bool            | Whether the maker order may rest.                       |
| `postOnly`             | bool            | Whether the maker order is participate-don't-initiate.  |
| `rfqCreatorUserId`     | string          | Pseudonymous requester identity.                        |
| `rfqCashOrderQty`      | optional string | Parent RFQ cash notional, when cash-sized.              |
| `buyQtyDecimal`        | string          | Server-derived requester-buy quantity.                  |
| `sellQtyDecimal`       | string          | Server-derived requester-sell quantity.                 |
| `updatedTime`          | `Timestamp`     | Last durable state change.                              |
| `acceptedSide`         | `Side`          | Requester's accepted side, when selected.               |
| `acceptedTime`         | `Timestamp`     | Acceptance time, when selected.                         |
| `confirmedTime`        | `Timestamp`     | Confirmation time, when confirmed.                      |
| `confirmationDeadline` | `Timestamp`     | Maker's last-look deadline, when accepted.              |
| `executionDeadline`    | `Timestamp`     | Scheduled paired-order submission time, when confirmed. |
| `executedTime`         | `Timestamp`     | Durable execution-state timestamp, when executed.       |
| `rfqCreatorOrderId`    | optional string | Requester's exchange order ID, when available.          |
| `creatorOrderId`       | optional string | Quoter's exchange order ID, when available.             |

The requester and quoter can both see both exchange order IDs on the embedded `Quote`. Client order IDs are not part of durable `Quote` state.

## Lifecycle-Specific Fields

| Event             | Additional fields                                                                                    |
| ----------------- | ---------------------------------------------------------------------------------------------------- |
| `quote_accepted`  | `confirmationDeadline`: authoritative deadline for `ConfirmQuote` or `DeleteQuote`.                  |
| `quote_confirmed` | `executionDeadline`: scheduled paired-order submission time.                                         |
| `quote_executed`  | `orderId`, `clientOrderId`, and `executedTime`. Order IDs are specific to the receiving participant. |

These existing recipient-specific wrapper fields remain for compatibility. The embedded `Quote` contains the durable execution timestamps and both participants' exchange order IDs.

`quote_executed` reports successful paired order submission, not a fill. Reconcile the subsequent exchange order and fill lifecycle through Drop Copy.

## Python Example

```python theme={null}
import grpc
from polymarket.v1 import rfq_pb2, rfq_pb2_grpc


def stream_rfq_events(access_token: str, participant_id: str) -> None:
    credentials = grpc.ssl_channel_credentials()
    metadata = (
        ("authorization", f"Bearer {access_token}"),
        ("x-participant-id", participant_id),
    )

    with grpc.secure_channel(
        "grpc-api.prod.polymarketexchange.com:443",
        credentials,
    ) as channel:
        stub = rfq_pb2_grpc.RFQAPIStub(channel)
        request = rfq_pb2.StreamRFQEventsRequest()

        for response in stub.StreamRFQEvents(request, metadata=metadata):
            event_type = response.WhichOneof("event")

            if event_type == "rfq_created":
                rfq = response.rfq_created.rfq
                print(f"RFQ opened: {rfq.id} {rfq.symbol}")
                if rfq.HasField("tick_size"):
                    print(f"  tick in dollars: {rfq.tick_size}")
                else:
                    print("  tick unavailable: look up the exact symbol with GetCombos")
                for leg in rfq.combo_legs:
                    settlement = (
                        leg.settlement_price
                        if leg.HasField("settlement_price")
                        else "unavailable"
                    )
                    print(f"  {leg.side} {leg.symbol}: {settlement}")

            elif event_type == "rfq_closed":
                rfq = response.rfq_closed.rfq
                print(f"RFQ closed: {rfq.id}")

            elif event_type == "quote_accepted":
                event = response.quote_accepted
                print(
                    f"Quote accepted: {event.quote.id}; "
                    f"confirm by {event.confirmation_deadline}"
                )

            elif event_type == "quote_confirmed":
                event = response.quote_confirmed
                print(
                    f"Quote confirmed: {event.quote.id}; "
                    f"execution scheduled for {event.execution_deadline}"
                )

            elif event_type == "quote_executed":
                event = response.quote_executed
                print(
                    f"Quote submitted: {event.quote.id}; "
                    f"order={event.order_id}"
                )
```

## Delivery and Recovery

| Behavior   | Contract                                                                                             |
| ---------- | ---------------------------------------------------------------------------------------------------- |
| Delivery   | Live, best-effort push after committed state changes.                                                |
| Filtering  | No request filters. Public RFQ events and participant-visible private quote events share the stream. |
| Replay     | None. A new stream starts with new events only.                                                      |
| Handoff    | No gap-free handoff between a read and stream subscription.                                          |
| Ordering   | No ordering guarantee across publishers or reconnects.                                               |
| Duplicates | Clients must tolerate duplicates.                                                                    |

On startup:

1. Open the stream.
2. Read current RFQs with `GetRFQs`.
3. Read the participant's current quotes with `GetQuotes`.
4. Apply subsequent events idempotently by RFQ or quote ID and `updatedTime`.

After a disconnect, reopen the stream and repeat both durable reads. If any stream event may have been missed, `GetQuotes` is the durable recovery path for the current Quote execution state. An empty read collection is a valid snapshot.

## Errors

| gRPC code             | Typical cause                                                                    |
| --------------------- | -------------------------------------------------------------------------------- |
| `INVALID_ARGUMENT`    | Invalid request shape.                                                           |
| `UNAUTHENTICATED`     | Missing, expired, or invalid bearer token or participant authorization metadata. |
| `PERMISSION_DENIED`   | Token lacks `read:orders` or participant access.                                 |
| `FAILED_PRECONDITION` | RFQs are blocked for the participant or participant token setup is not ready.    |
| `RESOURCE_EXHAUSTED`  | The firm exceeded the one-new-stream-per-second limit.                           |
| `UNAVAILABLE`         | Gateway or upstream RFQ service is unavailable.                                  |
| `DEADLINE_EXCEEDED`   | Client or upstream deadline elapsed.                                             |

## See Also

<CardGroup cols={2}>
  <Card title="Combos Guide" icon="shuffle" href="/trader-guide/combos">
    Maker workflow and quote rules
  </Card>

  <Card title="RFQ API" icon="code" href="/institutional/rfqs/overview">
    RFQ and quote REST and unary gRPC operations
  </Card>

  <Card title="gRPC Authentication" icon="key" href="/streaming-endpoints/authentication">
    Metadata, tokens, and scopes
  </Card>

  <Card title="Drop Copy" icon="right-left" href="/streaming-endpoints/dropcopy-stream">
    Exchange order and fill reconciliation
  </Card>
</CardGroup>
