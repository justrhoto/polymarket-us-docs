> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Create an Order

> Place an order with a declared vendor fee — recorded against the order and passed through to the exchange in one idempotent call.

<Warning>
  **BETA — SUBJECT TO CHANGE.** This API is in beta and may change without notice.
</Warning>

`CreateVendorOrder` is the partner order-entry call: it validates the supported structure of an embedded public `polymarket.v1.InsertOrderRequest`, **records your declared vendor fee against the order**, passes the order through to the exchange, and waits for its durable outcome before returning.

No money moves in this call — the order trades against cash already in the participant's account, and the vendor fee [accrues for later collection](/partners/funding/vendor-fees). The exchange is authoritative for order economics and buying-power validation; `CreateVendorOrder` does not calculate or return order economics.

## Service definition

* **Service:** `polymarket.us.orderfunding.v1.OrderFundingService`
* **RPC:** `CreateVendorOrder`
* **Type:** Unary (request/response)

```protobuf theme={null}
service OrderFundingService {
  rpc CreateVendorOrder(CreateVendorOrderRequest)
      returns (CreateVendorOrderResponse);
}

message CreateVendorOrderRequest {
  polymarket.v1.InsertOrderRequest order = 1;
  MoneyAmount vendor_fee = 2;
  string idempotency_key = 3;
}
```

## Request

### CreateVendorOrderRequest

| Field             | Type                               | Required | Description                                                                                                                                                                                           |
| ----------------- | ---------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `order`           | `polymarket.v1.InsertOrderRequest` | Yes      | The public order-entry shape. Set only the [supported fields](/partners/orders/data-model#supported-fields).                                                                                          |
| `vendor_fee`      | `MoneyAmount`                      | Yes      | Your fixed USD vendor fee for this order. It is recorded against the exchange order ID and collected later with a [`VENDOR_FEES` transfer](/partners/funding/vendor-fees), never moved at order time. |
| `idempotency_key` | `string`                           | Yes      | Your unique key for this placement request. Persist it before calling the service.                                                                                                                    |

The participant is identified **only by `order.account`**. Use the DCM trading account returned by the KYC approval webhook—the same account identifier used to match the participant's Drop Copy activity. There is no separate customer-account field in this request. Do not set `order.user` or `order.session_id`; both are rejected.

<Warning>
  The embedded public message is wider than the partner launch surface. The service uses a fail-closed allowlist: if you populate an unsupported field, the request is rejected with `INVALID_ARGUMENT` and an error that names the offending field. Do not copy a generic `InsertOrderRequest` wholesale; construct one of the supported shapes below.
</Warning>

## Response

### CreateVendorOrderResponse

| Field                | Type                 | Description                                                                                                                                                                                                                            |
| -------------------- | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `funding_request_id` | `string`             | Service-assigned durable identifier for this placement workflow. Persist it even if `id` is empty, and include it in support requests.                                                                                                 |
| `id`                 | `string`             | Exchange order identifier, when the exchange assigned one. The vendor fee for an accepted order is recorded under this ID, which is also `order_id` on the [Vendor Fees report](/partners/funding/vendor-fees#the-vendor-fees-report). |
| `status`             | `VendorOrderStatus`  | Durable or current placement outcome. See below.                                                                                                                                                                                       |
| `correlation`        | `FundingCorrelation` | Partner and service identifiers for recovery, audit, and support. Log these.                                                                                                                                                           |

### FundingCorrelation

| Field                | Type     | Description                                                                                              |
| -------------------- | -------- | -------------------------------------------------------------------------------------------------------- |
| `idempotency_key`    | `string` | Your idempotency key from the request.                                                                   |
| `funding_request_id` | `string` | The same durable placement-workflow identifier as the top-level field. It remains stable across retries. |
| `request_id`         | `string` | Per-attempt service request identifier for support and audit. It changes on each retry.                  |
| `clord_id`           | `string` | Your `order.clord_id`, echoed for recovery and Drop Copy correlation.                                    |

### VendorOrderStatus

| Status                         | Meaning                                                                                                                                                                                                                                                                                  |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `VENDOR_ORDER_STATUS_ACCEPTED` | The exchange durably accepted the order — including an order that matched immediately or was cancelled under fill-or-kill. Acceptance does not mean the order is resting or filled; learn execution outcomes from Drop Copy. The vendor fee is recorded against the order. **Terminal.** |
| `VENDOR_ORDER_STATUS_REJECTED` | The order was rejected. Nothing was recorded and no fee accrues. **Terminal.**                                                                                                                                                                                                           |
| `VENDOR_ORDER_STATUS_PENDING`  | The service could not establish the durable exchange outcome before its deadline. No collectible vendor fee exists yet. **Durable, but not terminal.**                                                                                                                                   |

<Info>
  **`ACCEPTED` means durable acceptance, not an execution state.** The service does not report acceptance based on submission alone, but an accepted order may have rested, matched immediately, or been cancelled under FOK. Track fills and other execution outcomes on [Drop Copy](/streaming-endpoints/dropcopy-stream). An order the exchange rejects asynchronously after submission is returned as `REJECTED`, not as a phantom accepted order.
</Info>

## Funding request lifecycle

Every successful `CreateVendorOrder` call returns a durable `funding_request_id` and the workflow's current `status`. `PENDING` is a valid durable response, not a gRPC error: submission may have happened, but the service has not yet established the final exchange outcome.

When a response is `PENDING`, re-check it by calling `CreateVendorOrder` again with the **identical request**, including the same `idempotency_key` and `order.clord_id`. The service resumes the existing workflow and returns the same `funding_request_id` with its current status. Continue bounded re-checks until the status is terminal:

* `VENDOR_ORDER_STATUS_ACCEPTED` — terminal accepted outcome.
* `VENDOR_ORDER_STATUS_REJECTED` — terminal rejected outcome.

Do **not** rotate the idempotency key while a funding request is pending. A new key identifies a new placement workflow and can create a duplicate order. If you reuse the original key with any caller-controlled field changed, the service returns gRPC `ALREADY_EXISTS` instead of modifying the existing workflow.

Persist the `funding_request_id`, `idempotency_key`, and `clord_id` together. The funding request ID identifies the workflow even before an exchange order ID exists and is the primary identifier to quote in support requests.

## Supported order examples

These examples deliberately populate only the launch fields. They assume the instrument publishes `priceScale = 100` and `fractionalQtyScale = 100` in [Reference Data](/institutional/refdata/overview). Use each instrument's published scales when converting decimal prices and quantities to integers. Every order must set exactly one of `order_qty` or `cash_order_qty`.

### Consumer FOK share limit order

This order buys 100 shares at a limit price of \$0.45 and must fill immediately in full or cancel.

```python theme={null}
import uuid
from polymarket.v1 import trading_pb2
from polymarket.us.orderfunding.v1 import order_funding_pb2

clord_id = f"order-{uuid.uuid4()}"
idempotency_key = str(uuid.uuid4())

request = order_funding_pb2.CreateVendorOrderRequest(
    order=trading_pb2.InsertOrderRequest(
        type=trading_pb2.ORDER_TYPE_LIMIT,
        side=trading_pb2.SIDE_BUY,
        order_qty=10_000,  # 100.00 shares at fractionalQtyScale=100
        symbol="<market-symbol>",
        price=45,  # $0.45 at priceScale=100
        time_in_force=trading_pb2.TIME_IN_FORCE_FILL_OR_KILL,
        clord_id=clord_id,
        account="<participant-dcm-account>",
        manual_order_indicator=trading_pb2.MANUAL_ORDER_INDICATOR_MANUAL,
    ),
    vendor_fee=order_funding_pb2.MoneyAmount(value="0.10", currency="USD"),
    idempotency_key=idempotency_key,
)

response = stub.CreateVendorOrder(request, metadata=metadata)
```

### Consumer share order: BUY 10 NO at \$0.20

There is one order book per market, in instrument (YES) terms, and `price` is always the YES price. Express BUY 10 NO at \$0.20 as SELL 10 YES at the complementary \$0.80 price. The contract quantity remains 10.

```python theme={null}
request = order_funding_pb2.CreateVendorOrderRequest(
    order=trading_pb2.InsertOrderRequest(
        type=trading_pb2.ORDER_TYPE_LIMIT,
        side=trading_pb2.SIDE_SELL,
        order_qty=1_000,  # 10.00 contracts at fractionalQtyScale=100
        symbol="<market-symbol>",
        price=80,  # YES $0.80 at priceScale=100; equivalent to NO $0.20
        time_in_force=trading_pb2.TIME_IN_FORCE_FILL_OR_KILL,
        clord_id=f"order-{uuid.uuid4()}",
        account="<participant-dcm-account>",
        manual_order_indicator=trading_pb2.MANUAL_ORDER_INDICATOR_MANUAL,
    ),
    vendor_fee=order_funding_pb2.MoneyAmount(value="0.10", currency="USD"),
    idempotency_key=str(uuid.uuid4()),
)

response = stub.CreateVendorOrder(request, metadata=metadata)
```

A fill changes the participant's position by -10 in YES terms. Economically, buying 10 NO contracts at \$0.20 costs \$2.00, with \$0.08 commission in this example charged additionally. The cost is reflected in the account's buying power. Partners can query the authoritative cash `balance` and `buying_power` with `polymarket.v1.PositionAPI/GetAccountBalance`; see [Reconciliation](/partners/reconciliation).

The same complementary convention applies in the other direction: SELL `q` NO at `p` is BUY `q` YES at `1 − p`. See [Outcomes and prices](/partners/orders/data-model#outcomes-and-prices).

### Consumer cash BUY: spend \$20 on YES

Set `cash_order_qty` instead of `order_qty` when the participant specifies a dollar principal. `ORDER_TYPE_LIMIT` supports this shape. This order spends \$20.00 of principal at a YES limit price of \$0.80.

```python theme={null}
request = order_funding_pb2.CreateVendorOrderRequest(
    order=trading_pb2.InsertOrderRequest(
        type=trading_pb2.ORDER_TYPE_LIMIT,
        side=trading_pb2.SIDE_BUY,
        cash_order_qty=2_000,  # $20.00 principal at priceScale=100; omit order_qty
        symbol="<market-symbol>",
        price=80,  # YES $0.80 at priceScale=100
        time_in_force=trading_pb2.TIME_IN_FORCE_FILL_OR_KILL,
        clord_id=f"order-{uuid.uuid4()}",
        account="<participant-dcm-account>",
        manual_order_indicator=trading_pb2.MANUAL_ORDER_INDICATOR_MANUAL,
    ),
    vendor_fee=order_funding_pb2.MoneyAmount(value="0.10", currency="USD"),
    idempotency_key=str(uuid.uuid4()),
)

response = stub.CreateVendorOrder(request, metadata=metadata)
```

For a cash BUY, contract quantity is the principal divided by the actual execution price. The \$20.00 principal fills 25 contracts when execution occurs at the \$0.80 limit, or 62.5 contracts with price improvement to \$0.32; the limit bounds the worst-case price. In the fill-at-limit example, a \$0.20 commission makes the total cash decrease \$20.20. Commission is charged in addition to `cash_order_qty`.

### Consumer cash SELL: spend \$20 on NO

On `SIDE_SELL`, `cash_order_qty` is complementary NO collateral, not target proceeds. “Spend \$20 on NO at up to \$0.20” is expressed as a SELL with a YES limit price of \$0.80:

```python theme={null}
request = order_funding_pb2.CreateVendorOrderRequest(
    order=trading_pb2.InsertOrderRequest(
        type=trading_pb2.ORDER_TYPE_LIMIT,
        side=trading_pb2.SIDE_SELL,
        cash_order_qty=2_000,  # $20.00 NO collateral at priceScale=100; omit order_qty
        symbol="<market-symbol>",
        price=80,  # YES $0.80 at priceScale=100; equivalent to NO $0.20
        time_in_force=trading_pb2.TIME_IN_FORCE_FILL_OR_KILL,
        clord_id=f"order-{uuid.uuid4()}",
        account="<participant-dcm-account>",
        manual_order_indicator=trading_pb2.MANUAL_ORDER_INDICATOR_MANUAL,
    ),
    vendor_fee=order_funding_pb2.MoneyAmount(value="0.10", currency="USD"),
    idempotency_key=str(uuid.uuid4()),
)

response = stub.CreateVendorOrder(request, metadata=metadata)
```

The exchange divides the \$20.00 cash quantity by the \$0.20 complement, so the \$20.00 buys 100 NO contracts at \$0.20. Commission is additional—\$0.80 in this example.

<Warning>
  On a SELL, `cash_order_qty = 2_000` does not mean “sell enough to receive \$20.00.” It means spend \$20.00 of complementary NO collateral.
</Warning>

## Buying power and previews

The exchange validates buying power when the order is placed and rejects an order unless the participant account's available cash covers its worst-case collateral plus the applicable exchange fee. This authoritative placement check does not reserve accrued vendor fees. Before submission, you may provide client-side guidance by gating against:

```
spendable balance = account cash − accrued uncollected vendor fees
```

For a BUY share limit order, client-side worst-case collateral is the contract quantity multiplied by the YES limit price. For a SELL share limit order expressing a NO position, it is the contract quantity multiplied by the complementary NO price. For a cash order, `cash_order_qty` is the principal: YES principal on BUY or complementary NO collateral on SELL. Add the maximum exchange fee from the [fee schedule](/fees) when estimating required cash; fees are additional to `cash_order_qty`.

`CreateVendorOrder` does not calculate these amounts. You may calculate them in your client or separately call the public `polymarket.v1.OrderEntryAPI/PreviewOrder` with the participant's order shape. The preview is optional and informational, not a locked quote; the exchange validates the order again at placement.

## Idempotency and retries

The `idempotency_key` identifies one placement request for your authenticated firm, while `order.clord_id` is your standard FIX tag-11 client order ID and recovery key. Persist both **before** the first call. The service guarantees **at most one order per idempotency key — retrying with the same key can never place a duplicate order or double-charge the declared vendor fee.**

* **Retry transport failures and timeouts** with the same complete request and the **same `idempotency_key` and `clord_id`**. If the original attempt completed, the service returns its recorded result; otherwise it resumes or resolves the workflow.
* **Retry `PENDING`** the same way. The service re-checks the exchange outcome and returns the same funding request with its current status.
* **Match Drop Copy by account and `clord_id`.** `order.account` is the DCM account on Drop Copy, and the exchange echoes `order.clord_id` as `clOrdID`.
* **Never change the request under an existing key.** A different `clord_id`, account, order field, or vendor fee returns `ALREADY_EXISTS`.
* **Never rotate the key for a pending request.** A new key creates a new workflow and can submit a duplicate order.
* **Never reuse a `clord_id` across live orders for the same participant.** Use a fresh idempotency key and client order ID for each new order.

## Cancelling an order

An order placed through this service is a standard exchange order. Cancel it through the standard [order entry cancel](/institutional/trading/overview). Cancellation does not alter the recorded vendor fee: the platform records exactly what you declared at placement. If your fee policy waives fees on cancelled or unfilled orders, apply that policy in your books and in the amount you [collect](/partners/funding/vendor-fees#collecting-the-fees).

## Errors

| gRPC status           | Meaning                                                                                                                                                    | Retry guidance                                                                                |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `INVALID_ARGUMENT`    | A required field is missing; an order or vendor fee is malformed; or an unsupported embedded field is set. The error names an offending unsupported field. | Fix the request. Do not retry as-is.                                                          |
| `UNAUTHENTICATED`     | Missing or invalid access token.                                                                                                                           | Refresh the token and retry.                                                                  |
| `PERMISSION_DENIED`   | Your firm is disabled or the vendor-fee policy denies the request.                                                                                         | Do not retry unchanged until authorization or policy is corrected.                            |
| `NOT_FOUND`           | No customer relationship exists for your firm and `order.account`. The same generic error is returned if the account belongs to another firm.              | Correct `order.account`.                                                                      |
| `FAILED_PRECONDITION` | The customer relationship is inactive, ambiguous, stale, or draining.                                                                                      | Correct the relationship state, then retry according to whether the placement intent changed. |
| `ALREADY_EXISTS`      | The `idempotency_key` is already bound to a different caller-controlled request.                                                                           | Replay the original request, or use a fresh key only for a genuinely new placement intent.    |
| `UNAVAILABLE`         | Transient relationship, policy, persistence, token-minting, or exchange unavailability before a known submission outcome.                                  | Retry the identical request with the **same** `idempotency_key`.                              |

An order-level rejection from the exchange, such as **insufficient buying power** or a price outside market limits, is not a gRPC error. The call returns `OK` with `status = VENDOR_ORDER_STATUS_REJECTED`; `FAILED_PRECONDITION` is reserved for relationship-state problems. Quote the `correlation` identifiers when requesting the underlying rejection detail from support.
