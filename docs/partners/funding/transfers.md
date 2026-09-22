> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Transfers

> The cash-movement API for deposits, withdrawals, and vendor fee collection between the partner funding account and participant accounts.

<Warning>
  **BETA — SUBJECT TO CHANGE.** This API is in beta and may change without notice.
</Warning>

A **transfer** moves cash between your **partner funding account** and a **participant account** under your Firm. It is the only way money enters or leaves a participant account outside of trading itself, and it exists for exactly three reasons:

| Reason        | Direction                             | Business event                                                                                                         |
| ------------- | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `DEPOSIT`     | Funding account → participant account | The participant allocated wallet funds to trade — see [Deposits & Withdrawals](/partners/funding/deposits-withdrawals) |
| `WITHDRAWAL`  | Participant account → funding account | The participant withdrew funds from trading — see [Deposits & Withdrawals](/partners/funding/deposits-withdrawals)     |
| `VENDOR_FEES` | Participant account → funding account | Periodic collection of accrued vendor fees — see [Vendor Fees](/partners/funding/vendor-fees)                          |

**Direction is fixed by the reason.** You name only the participant account; the platform resolves your funding account from your firm's configured funding relationship and derives the source and destination from the reason. There is no way to express any other movement — transfers to your firm, between participants, or to an external destination are structurally impossible.

## Service

**Service:** `polymarket.us.cashmovement.v1.CashMovementService`

| RPC                        | Purpose                                                                 |
| -------------------------- | ----------------------------------------------------------------------- |
| `CreateCashMovement`       | Create an idempotent deposit, withdrawal, or vendor fee transfer.       |
| `GetCashMovement`          | Read a transfer workflow by `workflow_id`.                              |
| `GetFundingAccountBalance` | Read the authoritative current balance of your partner funding account. |

All methods require the `write:cash-movements` scope.

Cash-movement calls are **firm-scoped** — do not send `x-participant-id`. Your firm submits transfers and reads the funding account on behalf of your funding entity under the three-party agreement; the platform verifies your firm is authorized for the funding account on every call.

### CreateCashMovement

```protobuf theme={null}
message CreateCashMovementRequest {
  string idempotency_key;
  oneof intent { Transfer transfer; }
}

message Transfer {
  TransferReason reason;          // DEPOSIT | WITHDRAWAL | VENDOR_FEES
  string participant_account_id;  // the participant account — the other side is always your funding account
  string amount;                  // exact decimal
  string currency;                // ISO 4217, must be USD
  string external_reference;      // your reference (required)
  string memo;                    // free text (optional)
}

enum TransferReason {
  TRANSFER_REASON_UNSPECIFIED = 0;
  TRANSFER_REASON_DEPOSIT = 1;
  TRANSFER_REASON_WITHDRAWAL = 2;
  TRANSFER_REASON_VENDOR_FEES = 3;
}

message CreateCashMovementResponse { CashMovement cash_movement; }
```

| Field                    | Required?    | Notes                                                                                                                                                                                                                              |
| ------------------------ | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `reason`                 | **Required** | Determines the direction — see the table above.                                                                                                                                                                                    |
| `participant_account_id` | **Required** | The participant trading account, in the same format returned by the account onboarding/list APIs. Must belong to your Firm.                                                                                                        |
| `amount`                 | **Required** | The exact decimal amount to move.                                                                                                                                                                                                  |
| `currency`               | **Required** | ISO 4217 code matching the account. `USD`.                                                                                                                                                                                         |
| `external_reference`     | **Required** | Your journal/ledger entry ID, or the instruction reference from your funding entity — it joins Polymarket US records to your books and to the three-party instruction chain. Quote it alongside `workflow_id` in support requests. |
| `memo`                   | Optional     | Human-readable note for support/audit — not parsed.                                                                                                                                                                                |

### GetCashMovement

```protobuf theme={null}
message GetCashMovementRequest { string workflow_id; }
message GetCashMovementResponse { CashMovement cash_movement; }

message CashMovement {
  string workflow_id;
  string idempotency_key;
  string intent_type;             // "transfer"
  CashMovementStatus status;      // PENDING, CONFIRMED, REJECTED, AMBIGUOUS
  string amount;
  string currency;
  string source_account_id;       // derived from the reason
  string destination_account_id;  // derived from the reason
  string dco_transfer_id;
  string rejection_reason;
  google.protobuf.Timestamp created_at;
  google.protobuf.Timestamp updated_at;
  TransferReason reason;
}
```

The read model returns the typed `reason` and derived source and destination accounts, but it does not echo `participant_account_id`, `external_reference`, or `memo`. Persist those request fields in your own ledger alongside `workflow_id`. There are no order, execution, or market correlation fields on a transfer. Both sides of a confirmed transfer appear on the [balance ledger](/streaming-endpoints/balance-ledger-stream) of the affected accounts, so your projection and your funding entity's records see the same event.

### GetFundingAccountBalance

`GetFundingAccountBalance` returns the authoritative balance of your partner funding account. The service resolves the account from your authenticated firm identity; there is no account parameter, and a firm can read only its own configured funding account.

This is a pure read with no side effects and no idempotency key. It is suitable for polling at modest rates and for seeding or verifying a real-time balance mirror.

```protobuf theme={null}
message GetFundingAccountBalanceRequest {
  string currency;
}

message GetFundingAccountBalanceResponse {
  string funding_account_id;
  string balance;
  string currency;
  google.protobuf.Timestamp as_of;
}
```

#### Request fields

| Field      | Type     | Required | Description                                                                                 |
| ---------- | -------- | -------- | ------------------------------------------------------------------------------------------- |
| `currency` | `string` | Yes      | Currency configured for your funding relationship. Use `USD`; matching is case-insensitive. |

#### Response fields

| Field                | Type                        | Description                                                                                                                              |
| -------------------- | --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `funding_account_id` | `string`                    | Your partner funding account. This is the same identifier returned as `source_account_id` or `destination_account_id` on transfer reads. |
| `balance`            | `string`                    | Authoritative account balance as an exact decimal string.                                                                                |
| `currency`           | `string`                    | Currency of the returned balance.                                                                                                        |
| `as_of`              | `google.protobuf.Timestamp` | The exchange ledger's balance update time.                                                                                               |

#### Example

Request:

```json theme={null}
{
  "currency": "USD"
}
```

Response (Connect JSON representation):

```json theme={null}
{
  "fundingAccountId": "firms/example-funding-entity/accounts/funding",
  "balance": "125000.50",
  "currency": "USD",
  "asOf": "2026-08-10T14:30:00Z"
}
```

#### Errors

| gRPC status         | Meaning                                                                          | Retry guidance                                                             |
| ------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `INVALID_ARGUMENT`  | `currency` does not match the currency configured for your funding relationship. | Send the configured currency (`USD`). Do not retry the unchanged request.  |
| `UNAUTHENTICATED`   | Missing or invalid access token.                                                 | Refresh the token and retry.                                               |
| `PERMISSION_DENIED` | Your firm is not configured for transfers.                                       | Contact [institutional@polymarket.us](mailto:institutional@polymarket.us). |
| `UNAVAILABLE`       | The upstream balance read failed.                                                | Retry with backoff.                                                        |

## Insufficient funds

A transfer is rejected if the **source account** cannot cover the amount:

| Reason        | Source              | Insufficient-funds case                                                                                    |
| ------------- | ------------------- | ---------------------------------------------------------------------------------------------------------- |
| `DEPOSIT`     | Funding account     | The pool is short — top it up from your funding entity's treasury and retry.                               |
| `WITHDRAWAL`  | Participant account | The participant's *free* cash (net of collateral locked by open orders and positions) is below the amount. |
| `VENDOR_FEES` | Participant account | The participant's free cash is below the accrued amount — e.g. trading losses since accrual.               |

This is enforced across the system regardless of reason — no transfer can drive an account negative. **Managing the risk is on you and your funding entity**: gate spendable balance so accrued fees stay covered ([Vendor Fees](/partners/funding/vendor-fees#accrued-fees-are-credit-exposure)), and check free cash before initiating withdrawals ([Deposits & Withdrawals](/partners/funding/deposits-withdrawals#withdrawals)).

## Frequency rules

Transfers are a limited, shared resource — see [the transfer budget](/partners/funding/overview#the-transfer-budget):

* **`DEPOSIT` / `WITHDRAWAL`** — event-driven: **typically one transfer per wallet deposit/withdrawal event** per participant. Mirroring wallet events 1:1 is the intended pattern; batch micro-events into fewer, larger transfers where your product allows.
* **`VENDOR_FEES`** — **at most once per day per participant account.** Collecting weekly or monthly is fine; collecting more often than daily is not permitted.

## Rate limits and smoothing

Budget for a maximum of **5 transfer calls per second** across your whole integration. Requests over the limit are rejected with gRPC `RESOURCE_EXHAUSTED` (HTTP 429 on any REST mapping) — the transfer was **not** created, and it is always safe to retry with the same `idempotency_key`.

Design for the budget rather than reacting to rejections:

* **Single dispatcher, client-side queue.** Route every transfer through one queue per environment drained at a fixed rate below the cap (e.g. 4/s, leaving headroom for retries). Never fan transfers out from concurrent workers straight to the API.
* **Spread scheduled runs.** An end-of-day vendor fee collection across 2,000 participant accounts at 4/s takes \~8–9 minutes — schedule the run as a paced drain, not 2,000 simultaneous calls at the stroke of EOD.
* **Retry with backoff and the same key.** On `RESOURCE_EXHAUSTED`, re-enqueue with jittered exponential backoff (e.g. 1s → 2s → 4s, ±20% jitter) and the **same** `idempotency_key`. The rejection happened before creation, so the retry is a fresh, safe attempt.
* **Deposits preempt fee collections.** If a participant is waiting to trade, their deposit is latency-sensitive; a fee collection is not. Give `DEPOSIT` transfers priority in your queue and let batch runs yield.

```python theme={null}
# Paced drain: one dispatcher, 4 transfers/second, deposits first
import time, queue

deposit_q, batch_q = queue.Queue(), queue.Queue()

def dispatch_loop(stub, metadata):
    while True:
        item = None
        try:
            item = deposit_q.get_nowait()          # deposits preempt
        except queue.Empty:
            try:
                item = batch_q.get(timeout=1.0)    # then batch work (fees, withdrawals)
            except queue.Empty:
                continue
        try:
            stub.CreateCashMovement(item.request, metadata=metadata)
        except grpc.RpcError as e:
            if e.code() == grpc.StatusCode.RESOURCE_EXHAUSTED:
                item.backoff = min(item.backoff * 2, 60)
                schedule_retry(item, delay=item.backoff * jitter())  # same idempotency_key
            else:
                raise
        time.sleep(0.25)                           # 4/s, headroom under the 5/s cap
```

## Idempotency and recovery

* Use a **distinct, durable idempotency key per logical transfer**, persisted before the call.
* A transport timeout or an `AMBIGUOUS` status is **not** permission to create a second workflow — replay the same create request with the same key, or read the original workflow by `workflow_id`.
* A replay must be **identical**: the request is hashed under the key, so retrying with a changed amount, account, reason, or reference is rejected as key reuse with a different request.
* Use bounded recovery for `PENDING` workflows rather than a permanent polling scheduler.
* Persist `workflow_id`, the reason, and `external_reference` through a terminal result — they are your join keys across your books, the [balance ledger](/streaming-endpoints/balance-ledger-stream), and support requests.

## Transfer workflow errors

The following statuses apply to `CreateCashMovement` and `GetCashMovement`.

| gRPC status           | Meaning                                                                                  | Retry guidance                                                                                                            |
| --------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `INVALID_ARGUMENT`    | Malformed amount/currency, unknown reason, or missing required field.                    | Fix the request. Do not retry as-is.                                                                                      |
| `UNAUTHENTICATED`     | Missing or invalid access token.                                                         | Refresh the token and retry.                                                                                              |
| `PERMISSION_DENIED`   | Your firm is not configured for transfers, or the requested transfer reason is disabled. | Contact [institutional@polymarket.us](mailto:institutional@polymarket.us).                                                |
| `NOT_FOUND`           | No customer relationship exists for your firm and `participant_account_id`.              | Fix the request.                                                                                                          |
| `FAILED_PRECONDITION` | The customer relationship or resolved transfer-account configuration is unavailable.     | Correct the relationship or account state before retrying.                                                                |
| `ALREADY_EXISTS`      | The `idempotency_key` was already used with a different request.                         | Replay the original request, or use a fresh key only for a genuinely new transfer.                                        |
| `RESOURCE_EXHAUSTED`  | Transfer rate limit exceeded; the transfer was not created.                              | Re-enqueue with backoff and the **same** `idempotency_key` — see [Rate limits and smoothing](#rate-limits-and-smoothing). |
| `UNAVAILABLE`         | Transient service unavailability.                                                        | Retry with the **same** `idempotency_key`.                                                                                |

An insufficient-funds outcome is not a gRPC error at create time: the workflow resolves to `status = REJECTED` with a `rejection_reason` — see [Insufficient funds](#insufficient-funds).

## Related pages

<CardGroup cols={2}>
  <Card title="Partner Funding Overview" icon="building-columns" href="/partners/funding/overview">
    The model — parties, money flows, and directional guarantees.
  </Card>

  <Card title="Deposits & Withdrawals" icon="money-bill-transfer" href="/partners/funding/deposits-withdrawals">
    Mirroring wallet allocations into buying power.
  </Card>

  <Card title="Vendor Fees" icon="file-invoice-dollar" href="/partners/funding/vendor-fees">
    Accrual, the daily report, and collection.
  </Card>

  <Card title="Reconciliation" icon="scale-balanced" href="/partners/reconciliation">
    Keeping your books in sync with the ledger.
  </Card>
</CardGroup>
