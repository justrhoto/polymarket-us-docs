> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Reconciliation

> How to keep a correct local mirror of orders, positions, and cash — and the read APIs that anchor it.

Your integration maintains a local projection of each participant's orders, positions, and cash. This page describes the operating pattern that keeps that projection correct, and the read APIs that anchor it to authoritative state.

## The operating pattern

**Streams are the system of record; reads are anchors.** The firm-scoped [Drop Copy execution and position streams](/streaming-endpoints/dropcopy-stream) drive your projection in real time. Unary reads exist for discovery, user-driven views, and reconciliation — they are not polling feeds.

* **Replay before new work.** Persist a stream response's `resume_token` only after every record in it is durably applied. Reconnect with the last committed token; deduplicate replayed events by stable exchange IDs.
* **Single active subscriber.** Run one leader-elected consumer per firm, environment, and stream. Followers take over from the durable cursor — never one subscription per pod, and never one stream per customer. How to open and hold those streams: [Streaming Best Practices](/streaming-endpoints/streaming-best-practices).
* **Reconcile after gaps.** After an outage: resume and replay the streams first, then compare your projections against the reads below, and surface freshness caveats rather than presenting incomplete state as final.
* **No cron pollers.** Reads are triggered by onboarding, user views, bounded workflow recovery, reconnect reconciliation, or an incident — not recurring schedules.

<Note>
  **A process restart is not a cold start.** Resume from your persisted checkpoint against your existing local database — don't re-run the unary reads below.
</Note>

"Cold start" means true first contact for a firm/account/environment your integration has never seen before — no persisted `resume_token` or `resume_time`, and no local projection to reconcile against. If you already persist your checkpoint, a restart just reconnects with it and keeps applying deltas to the state you already have, deduplicating anything replayed. Only a genuine no-checkpoint start (or a checkpoint too old to resume) falls back to the reads below.

## Reconciliation reads

The anchors are the standard gRPC read APIs — the same `polymarket.v1` services documented under [Institutional API](/grpc-api/overview), called with your partner credentials over TLS with a Bearer token. Full message definitions are in the [proto download](/grpc-api/overview); the tables below map each reconciliation concern to its RPC.

<Warning>
  **These are low-volume anchors, not a data-access layer.** Every RPC below is rate-limited per firm and must not be polled.
</Warning>

The correct architecture is **stream-first**: build your local database from [Drop Copy](/streaming-endpoints/dropcopy-stream) and [Order Stream](/streaming-endpoints/order-stream), serve reads from that database, and call these RPCs only for cold-start hydration, point-in-time queries, and gap recovery — never as a substitute for a subscription. See [Rate Limits](/trader-guide/rate-limits) for the full list; `SearchOrders`, `SearchExecutions`, and `SearchTrades`, for example, are capped at 12 requests/minute, and sustained call volume against any of these endpoints will get throttled.

### Cash balances — `polymarket.v1.PositionAPI`

An account balance is the authoritative cash figure for one account and currency, plus the risk context used to size orders — see [Balance Data](/institutional/positions/overview#balance-data) for the full field reference.

| RPC                   | Use                                                                                                                                                                                                                                  |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `GetAccountBalance`   | Authoritative cash balance for one account and currency. Returns `balance` plus risk context: `buying_power`, `capital_requirement`, `excess_capital`, `unsettled_funds`, `margin_requirement`, `open_orders`, and an `update_time`. |
| `ListAccountBalances` | All currencies for one account in one call.                                                                                                                                                                                          |

This balance read is the authoritative confirmation to take before initiating a [`WITHDRAWAL` transfer](/partners/funding/deposits-withdrawals#withdrawals) — confirm the participant's free cash covers the amount (net of accrued vendor fees) before creating the transfer.

#### Stream it instead

<Tip>
  **Streaming equivalent:** no dedicated balance-push stream exists — derive live balances from [Balance Ledger](#cash-ledger-polymarket-v1-fundingapi) deltas instead of polling this RPC.
</Tip>

* Apply `CreateBalanceLedgerSubscription` entries (`before_balance` / `after_balance`) to your projection as they arrive.
* Reserve `GetAccountBalance` / `ListAccountBalances` for a true first-time cold start and the pre-withdrawal confirmation above.
* On an ordinary restart, resume from the last `update_time` you persisted and keep applying deltas to the balance you already have — don't re-fetch it.

### Positions — `polymarket.v1.PositionAPI`

A position tracks net quantity, cost basis, and realized P\&L for one account and symbol — see [Position Data](/institutional/positions/overview#position-data) for the full field reference.

| RPC                    | Use                                                                                                                                                                                                                                                                                                                                                      |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ListAccountPositions` | Positions for one account, optionally filtered by `symbol`. Supports point-in-time queries via `as_of_time` (timestamp) or `as_of_date` (end of trade date) for after-the-fact reconciliation. Each `Position` carries net position, bought/sold quantities, cost, realized value, and `update_time`; the response carries `available_position` per row. |

#### Stream it instead

<Tip>
  **Streaming equivalent:** `CreatePositionChangeSubscription` on the [Drop Copy stream](/streaming-endpoints/dropcopy-stream) keeps positions current in real time.
</Tip>

* Call `ListAccountPositions` to hydrate a brand-new projection (true cold start) or to answer point-in-time (`as_of_time` / `as_of_date`) queries a stream can't answer — not on every process restart.
* A restarting service persists its position projection alongside the stream's `resume_token` and reconnects with that token; a routine restart is never a reason to re-fetch positions.

### Orders — `polymarket.v1.ReportAPI`

An order carries its full lifecycle state — quantity, price, fills, and status — see [Order Message Structure](/streaming-endpoints/order-stream#order-message-structure) for the full field reference (the same fields these reads return).

| RPC                                 | Use                                                                                                                                                                                                                                                                            |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `SearchOrders`                      | Paginated order search with filters for `order_id`, `clord_id`, `accounts`, `symbol`, time range, trade-date range, and order state (`order_state_filter`; use it to list open orders after an outage). Set `with_last_execution` to get each order's latest execution inline. |
| `GetOrder`                          | Single order by ID.                                                                                                                                                                                                                                                            |
| `SearchExecutions` / `SearchTrades` | Execution- and trade-level detail when reconciling fills rather than order state.                                                                                                                                                                                              |

#### Stream it instead

<Tip>
  **Streaming equivalent:** `CreateOrderSubscription` on the [Order Stream](/streaming-endpoints/order-stream) is snapshot **and** stream on one connection — no unary call is needed for cold start.
</Tip>

* Open with the default `snapshot_only: false`; the first message carries a `snapshot` of every currently-open order, then `update` messages push executions continuously.
* This request carries no `resume_token`, so a restart simply reconnects and gets a fresh snapshot for free — there's no checkpoint to persist for this one.
* Reserve `SearchOrders` / `GetOrder` for one-off lookups the live snapshot doesn't cover (e.g. a specific historical/closed order by ID).
* Drop Copy's execution and Trade Capture Report subscriptions, by contrast, carry a `resume_token` and no snapshot — hydrate firm-wide historical fills once via `SearchExecutions` / `SearchTrades` on true cold start, then resume the stream with the persisted token on every subsequent restart instead of re-querying.

### Cash ledger — `polymarket.v1.FundingAPI`

A ledger entry records a single cash-balance change with its before/after amounts — see [BalanceLedgerEntry Fields](/institutional/funding/overview#balanceledgerentry-fields) for the full field reference.

| RPC                               | Use                                                                                                                                                                                                                                   |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GetAccountBalanceLedger`         | Paginated, typed ledger of every cash balance change (deposits, withdrawals, fills, fees, adjustments) with before/after balances — see the [Funding reference](/institutional/funding/overview) for entry types and query semantics. |
| `CreateBalanceLedgerSubscription` | The streaming counterpart with replay — see [Balance Ledger Stream](/streaming-endpoints/balance-ledger-stream).                                                                                                                      |

The cash ledger is where every [transfer](/partners/funding/transfers) (deposits, withdrawals, vendor fee collections), fill, exchange fee, and settlement credit lands with before/after balances — it is the platform-side record your funding entity's books reconcile against, per account.

#### Stream it instead

<Tip>
  **Streaming equivalent:** `CreateBalanceLedgerSubscription` *is* the streaming equivalent here — it replays from `resume_time` and then pushes new entries live.
</Tip>

* Use `GetAccountBalanceLedger` only for paginated historical lookups and CSV exports, not as a live feed.
* Persist the `update_time` of the last applied entry and pass it back as `resume_time` on reconnect — a restart resumes the stream from that point, it does not re-run history from the beginning.

#### Firm-wide ledger consumption

The ledger subscription is **per-account** — one fully-qualified account per stream — and concurrent ledger streams per firm are tightly capped. Opening one stream per customer does not scale and is not the intended pattern.

<Note>
  **COMING SOON — firm-wide balance ledger subscription.** A firm-scoped subscription that delivers ledger entries for **all accounts under your Firm** on a single stream — with the same `resume_time` replay semantics and `entry.account` on every row for routing — is planned. The final consumption pattern will be documented when it ships; contact [institutional@polymarket.us](mailto:institutional@polymarket.us) if your rollout depends on it.
</Note>

Until then, cover the firm-wide need with the surfaces that are already firm-scoped:

* **Executions and positions:** the [Drop Copy streams](/streaming-endpoints/dropcopy-stream) are firm-wide — one execution stream and one position stream cover every account's trading activity.
* **Cash events:** drive per-account cash projections from your own transfer records (you initiate every deposit, withdrawal, and fee collection) plus firm-wide execution data, and reconcile against `GetAccountBalanceLedger` / CSV export per account on a batch cadence — not with per-account live streams.

<Info>
  **Decoding fees on fills.** Commission fields on execution reports are fixed-point notional units, scaled by both `price_scale` and `fractional_quantity_scale` — see [Fees on execution reports](/partners/orders/data-model#fees-on-execution-reports) before reconciling fill-level fees against the [fee schedule](/fees).
</Info>

<Info>
  **Joining orders to fees and funding.** For orders placed through the partner order API, the `clord_id` on execution streams is the **partner-assigned** `order.clord_id` from [`CreateVendorOrder`](/partners/orders/create-order), and the execution account is the same DCM identifier supplied as `order.account`. `SearchOrders` filters by `clord_id` directly. Keep the exchange `order_id` as the canonical venue identifier: it and your `clord_id` are the join keys on the [Vendor Fees report](/partners/funding/vendor-fees#the-vendor-fees-report). Persist the create response's correlation fields so ledger rows, stream events, fee records, and transfers all join cleanly.
</Info>

## Related pages

<CardGroup cols={2}>
  <Card title="Transfers" icon="right-left" href="/partners/funding/transfers">
    The cash-movement API these reads gate.
  </Card>

  <Card title="Drop Copy Stream" icon="copy" href="/streaming-endpoints/dropcopy-stream">
    The firm-scoped execution stream that drives your projection.
  </Card>

  <Card title="Order Stream" icon="list-check" href="/streaming-endpoints/order-stream">
    Real-time order and execution updates for your accounts.
  </Card>

  <Card title="Rate Limits" icon="gauge-high" href="/trader-guide/rate-limits">
    Per-endpoint limits for the reads on this page.
  </Card>
</CardGroup>
