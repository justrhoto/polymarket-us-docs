> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Order Data Model

> Supported fields for the public InsertOrderRequest embedded in partner order entry.

<Warning>
  **BETA — SUBJECT TO CHANGE.** This API is in beta and may change without notice.
</Warning>

`CreateVendorOrder` embeds the public `polymarket.v1.InsertOrderRequest`. The supported order shape for partner entry is intentionally narrow: **limit orders** with **fill-or-kill (FOK)** time in force and either a share quantity or a cash quantity such as “spend \$20.”

The service validates populated fields against a fail-closed allowlist. Any field marked **Rejected if set** below causes `INVALID_ARGUMENT`, with the offending field named in the error. This prevents newly added public-order features from becoming available to partner callers unintentionally.

## Supported fields

| `InsertOrderRequest` field          | Type                             | Partner support                             | Requirements                                                                                                                                                                                                            |
| ----------------------------------- | -------------------------------- | ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `type`                              | `OrderType`                      | **Required**                                | Must be `ORDER_TYPE_LIMIT`.                                                                                                                                                                                             |
| `side`                              | `Side`                           | **Required**                                | `SIDE_BUY` or `SIDE_SELL`, expressed in YES terms. Use the [complementary order](#outcomes-and-prices) for NO.                                                                                                          |
| `order_qty`                         | `int64`                          | **Optional; exactly one quantity required** | Positive contract quantity in the instrument's fixed-point quantity scale. Set exactly one of `order_qty` and `cash_order_qty`.                                                                                         |
| `symbol`                            | `string`                         | **Required**                                | Exchange symbol for the market.                                                                                                                                                                                         |
| `price`                             | `int64`                          | **Required**                                | Positive YES limit price in the instrument's fixed-point price scale, including for an order expressing a NO position.                                                                                                  |
| `time_in_force`                     | `TimeInForce`                    | **Required**                                | Must be `TIME_IN_FORCE_FILL_OR_KILL`. Every other time-in-force value is rejected.                                                                                                                                      |
| `clord_id`                          | `string`                         | **Required**                                | Your FIX tag-11 client order ID: 1–64 visible ASCII characters, unique across live orders for the participant. Echoed as `clOrdID` on Drop Copy and included in the Vendor Fees report.                                 |
| `account`                           | `string`                         | **Required**                                | The participant's DCM trading account from the KYC approval webhook. This is the sole customer identifier and the account used to match Drop Copy.                                                                      |
| `stop_price`                        | `int64`                          | **Rejected if set**                         | Stop and stop-limit orders are unsupported.                                                                                                                                                                             |
| `min_qty`                           | `int64`                          | **Rejected if set**                         | Minimum-quantity instructions are unsupported.                                                                                                                                                                          |
| `self_match_prevention_id`          | `string`                         | **Rejected if set**                         | Custom self-match prevention identifiers are unsupported.                                                                                                                                                               |
| `quote`                             | `string`                         | **Rejected if set**                         | Quote-linked orders are unsupported.                                                                                                                                                                                    |
| `all_or_none`                       | `bool`                           | **Rejected if set**                         | Use FOK for the supported all-or-cancel execution behavior.                                                                                                                                                             |
| `session_id`                        | `string`                         | **Rejected if set**                         | The service derives submission context. Do not copy a session from another API call.                                                                                                                                    |
| `user`                              | `string`                         | **Rejected if set**                         | The service derives the submitting participant from the authenticated firm's relationship to `account`.                                                                                                                 |
| `client_account_id`                 | `string`                         | **Rejected if set**                         | Use `account` as the account identifier.                                                                                                                                                                                |
| `client_participant_id`             | `string`                         | **Rejected if set**                         | The service derives the participant associated with `account`.                                                                                                                                                          |
| `participate_dont_initiate`         | `bool`                           | **Rejected if set**                         | Post-only behavior is unsupported.                                                                                                                                                                                      |
| `cash_order_qty`                    | `int64`                          | **Optional; exactly one quantity required** | Positive USD principal in the instrument's fixed-point price scale. On BUY, this is YES principal; on SELL, it is complementary NO collateral—not target proceeds. Set exactly one of `cash_order_qty` and `order_qty`. |
| `strict_limit`                      | `bool`                           | **Rejected if set**                         | Strict-limit behavior is unsupported.                                                                                                                                                                                   |
| `good_till_time`                    | `Timestamp`                      | **Rejected if set**                         | Non-default `good_till_time` is unsupported and rejected.                                                                                                                                                               |
| `best_limit`                        | `bool`                           | **Rejected if set**                         | Best-limit pricing is unsupported.                                                                                                                                                                                      |
| `immediately_executable_limit`      | `bool`                           | **Rejected if set**                         | Immediately-executable-limit behavior is unsupported.                                                                                                                                                                   |
| `self_match_prevention_instruction` | `SelfMatchPreventionInstruction` | **Rejected if set**                         | Custom self-match prevention instructions are unsupported.                                                                                                                                                              |
| `order_capacity`                    | `OrderCapacity`                  | **Rejected if set**                         | Custom order-capacity values are unsupported.                                                                                                                                                                           |
| `ignore_price_validity_checks`      | `bool`                           | **Rejected if set**                         | Price validity checks cannot be bypassed.                                                                                                                                                                               |
| `manual_order_indicator`            | `ManualOrderIndicator`           | **Required**                                | `MANUAL_ORDER_INDICATOR_MANUAL` for a human-entered order or `MANUAL_ORDER_INDICATOR_AUTOMATED` for a system-generated order.                                                                                           |

<Info>
  In proto3, scalar fields at their default value are not populated on the wire. “Rejected if set” means do not send a non-default value for that field. Construct the supported request directly rather than reusing a broad public-order object.
</Info>

## Outcomes and prices

There is one order book per market, expressed in instrument (YES) terms. `price` is always the YES price; there is no separate NO book or NO price field. Express a NO position with the complementary YES order:

```text theme={null}
BUY q NO @ p  ≡ SELL q YES @ (1 − p)
SELL q NO @ p ≡ BUY q YES @ (1 − p)
```

The quantity remains `q` contracts; do not convert it to a dollar amount. For example, buying 10 NO at \$0.20 requires `SIDE_SELL`, `order_qty = 1000`, and `price = 80` when both scales are `100`. A fill changes the YES-terms position by -10 contracts. Economically, buying the 10 NO contracts costs \$2.00, and the cost is reflected in the account's buying power. Commission is additional—\$0.08 in this example.

## Share and cash quantities

Set exactly one of `order_qty` or `cash_order_qty`. The service rejects requests that set both or neither.

* `order_qty` specifies a number of contracts and is unchanged when translating between YES and NO.
* On `SIDE_BUY`, `cash_order_qty` is the principal to spend on YES, and fill quantity is principal divided by actual execution price. A \$20.00 principal fills 25 contracts at the \$0.80 limit or 62.5 contracts with price improvement to \$0.32. The limit bounds the worst-case price; commission is additional to the principal.
* On `SIDE_SELL`, `cash_order_qty` is the complementary NO collateral to spend, not a target for sale proceeds. At a YES limit price of \$0.80, \$20.00 is divided by the \$0.20 complement and buys 100 NO contracts. "Spend \$20 on NO at up to \$0.20" therefore uses `SIDE_SELL`, `cash_order_qty = 2000`, and `price = 80` when `priceScale = 100`.

<Warning>
  On `SIDE_SELL`, `cash_order_qty = 2000` does not mean “sell enough to receive \$20.00.” It means commit \$20.00 of complementary NO collateral.
</Warning>

Cash quantities are valid with the partner surface's required `ORDER_TYPE_LIMIT`. Exchange commission is charged in addition to the principal represented by `cash_order_qty`.

## Fixed-point values

`price`, `order_qty`, and `cash_order_qty` are integers on the public exchange message. Convert user-facing decimals with the scales published for the instrument — the `priceScale` and `fractionalQtyScale` fields returned by the [Reference Data API](/institutional/refdata/overview):

```text theme={null}
wire price = decimal YES price × priceScale
wire contract quantity = decimal contracts × fractionalQtyScale
wire cash quantity = decimal USD principal × priceScale
```

For example, when both scales are `100`, a \$0.45 YES limit price is `price = 45`, 100 contracts is `order_qty = 10000`, and \$20.00 of principal is `cash_order_qty = 2000`. Divide by the same scales to convert wire integers back to decimals. Always use each instrument's published values; do not hard-code them.

## Fees on execution reports

Execution reports — on the [Drop Copy stream](/streaming-endpoints/dropcopy-stream) and from `SearchExecutions` / `SearchOrders` — carry the exchange fee in the same fixed-point convention as every other wire value. The commission fields are **notional units**, scaled by *both* the price scale and the quantity scale:

```text theme={null}
contracts        = order_qty / fractional_quantity_scale
price ($)        = price / price_scale
commission ($)   = commission_notional_collected / (price_scale × fractional_quantity_scale)
```

One dollar is `price_scale × fractional_quantity_scale` notional units. When both scales are `100`, `commission_notional_collected = 100` means **\$0.01** — not \$1.00.

The relevant fields:

| Field                                      | Where          | Meaning                                                                                                                                                                                                                                    |
| ------------------------------------------ | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `commission_notional_collected`            | execution      | Fee collected for this fill, in notional units. Negative values are rebates credited to the account.                                                                                                                                       |
| `commission_notional_total_collected`      | embedded order | Cumulative fee across all fills of the order, in notional units.                                                                                                                                                                           |
| `fractional_quantity_scale`, `price_scale` | embedded order | The scales to decode with. Also published per instrument as `fractionalQtyScale` / `priceScale` by the [Reference Data API](/institutional/refdata/overview); treat an instrument that does not publish `fractionalQtyScale` as scale `1`. |

The dollar amount always reconciles with the [fee schedule](/fees) formula `Fee = Θ × C × p × (1 − p)` — where `C` is **contracts** (not raw `order_qty` units) and `p` is the **decimal** price — rounded to \$0.01.

<Warning>
  The most common reconciliation mistake is using raw `order_qty` units as `C`. On an instrument with `fractional_quantity_scale = 100`, that overstates the fee 100×. Instruments with scale `1` make the naive math accidentally correct, so the error often surfaces only on the first fill in a scale-`100` market.
</Warning>

### Worked example — quantity scale 100

A taker buys `order_qty = 312` at `price = 97` on an instrument with `priceScale = 100` and `fractionalQtyScale = 100`. The fill execution report (captured from Drop Copy; identifiers anonymized):

```json theme={null}
{
  "id": "BW9QY8RWN52Z",
  "order": {
    "id": "BT3DNMHB94XJ",
    "type": "ORDER_TYPE_LIMIT",
    "side": "SIDE_BUY",
    "orderQty": "312",
    "symbol": "aachc-cfb-undefeated-2026-11-28-boise",
    "clordId": "example-taker-buy-01",
    "timeInForce": "TIME_IN_FORCE_FILL_OR_KILL",
    "account": "firms/ISV-Example-ClearingMember/accounts/example-trading-account",
    "cumQty": "312",
    "avgPx": "97",
    "state": "ORDER_STATE_FILLED",
    "priceToQuantityFilled": { "97": "312" },
    "commissionNotionalTotalCollected": "100",
    "priceScale": "100",
    "fractionalQuantityScale": "100"
  },
  "lastShares": "312",
  "lastPx": "97",
  "type": "EXECUTION_TYPE_FILL",
  "aggressor": true,
  "commissionNotionalCollected": "100"
}
```

Decode:

```text theme={null}
contracts   = 312 / 100                   = 3.12
price       = 97 / 100                    = $0.97
fee formula = 0.0695 × 3.12 × 0.97 × 0.03 = $0.006310 → rounds to $0.01
wire fee    = 100 / (100 × 100)           = $0.01  ✓
```

The account's balance-ledger entry for this fill confirms the same number: a debit of `3.0364` = `3.12 × $0.97` principal (`$3.0264`) plus the `$0.01` commission.

### Worked example — quantity scale 1

A taker buys `order_qty = 100` at `price = 97` on an instrument with `priceScale = 100` and `fractionalQtyScale = 1`, so `order_qty` **is** the contract count. The fill carries `commissionNotionalCollected = "20"` with `"fractionalQuantityScale": "1"`:

```text theme={null}
contracts   = 100 / 1                    = 100
price       = 97 / 100                   = $0.97
fee formula = 0.0695 × 100 × 0.97 × 0.03 = $0.202245 → rounds to $0.20
wire fee    = 20 / (100 × 1)             = $0.20  ✓
```

This matches the 100-lot examples in the [fee schedule](/fees) — those tables assume scale-`1` instruments. The ledger debit is `97.20` = `$97.00` principal + `$0.20` commission.

### Maker rebates and zero-fee fills

The same decoding applies to the maker side, where the fee coefficient is negative. The resting sell in the scale-`1` example above received `commissionNotionalCollected = "-4"` → `−$0.04`, matching `−0.0125 × 100 × 0.97 × 0.03 = −$0.036` rounded to the cent.

Because fees round to \$0.01, small fills legitimately produce **zero** fee: the maker rebate in the scale-`100` example rounds `−$0.0011` to `$0.00`, and the field is simply absent from the JSON (proto3 omits default values). Treat a missing commission field as `0`, not as missing data.

## Customer identity

`order.account` is the only customer identifier accepted by `CreateVendorOrder`. Persist the DCM account delivered when KYC is approved and use it consistently for:

* `order.account` on partner order placement
* `participant_account_id` on [transfers](/partners/funding/transfers)
* the account field on Drop Copy and reconciliation records

Do not set `order.user` or `order.session_id`. The service authenticates your firm, verifies that `order.account` belongs to an enabled participant relationship, and derives the submitting participant.

## MoneyAmount

| Field      | Type     | Description                               |
| ---------- | -------- | ----------------------------------------- |
| `value`    | `string` | Base-10 decimal string, such as `"0.10"`. |
| `currency` | `string` | ISO 4217 code. Must be `USD`.             |

`MoneyAmount` is used for the top-level `vendor_fee`; it is not used for the fixed-point fields in the embedded public order.

## Next step

<Card title="CreateVendorOrder" icon="bolt" href="/partners/orders/create-order" horizontal>
  See complete YES, NO, cash-BUY, and cash-SELL order examples.
</Card>
