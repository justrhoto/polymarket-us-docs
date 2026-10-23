> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Combos for Takers

> Decode, size, reconcile, and settle combo trades as an RFQ requester

This page answers the questions requesters most often ask when they integrate combos. For the maker workflow and quote rules, see the [Combos/RFQ guide](/trader-guide/combos.md). For how payouts work from a user's point of view, see the [Combos FAQs](/faqs/combos-faqs.md).

Combos and RFQs behave the same through the [Institutional API](/institutional/combos/overview.md) and the [Retail API](/api-reference/combos/overview.md). Validation, sizing, fees, and order handling do not depend on which one you use.

Treat a combo symbol as opaque. Existing combos use `caoc-...` and new combos use `crossd-...`.

## Price and Quantity Scales

**Does the Reference Data API return combo instruments?**

No. `POST /v1/refdata/instruments` does not return combo symbols. Use `GetCombos` (`GET /v1/combos?symbol=...`) for a combo's legs, state, and `tickSize`.

**Which scales do I use to decode combo executions?**

Read them from the order embedded in each Drop Copy execution. `order.price_scale` and `order.fractional_quantity_scale` are set on every combo order:

```
price ($)                = last_px / price_scale
filled contracts         = last_shares / fractional_quantity_scale
cumulative contracts     = cum_qty / fractional_quantity_scale
commission ($)           = commission_notional_collected / (price_scale × fractional_quantity_scale)
```

Do not hard-code combo scales. Combos created at different times carry different price scales, and `GetCombos` does not return a scale. Decode with the values on the order. To look up a combo's price scale before it trades, use [`GET /v1/instruments/{symbol}/settlement`](/institutional/settlement/overview), which returns `priceScale` for any exact symbol, including combos. See [Fees on execution reports](/partners/orders/data-model.md#fees-on-execution-reports) for a worked example.

## Cash RFQs and Fees

**Is the combo taker fee included in a cash RFQ's amount?**

Yes. For a cash RFQ on a combo, each quoted side is sized to the largest contract quantity whose cost plus the combo taker fee fits within `cashOrderQty`:

```
contracts × cost per contract + combo taker fee ≤ cashOrderQty
```

The cost per contract is the price for a requester buy and `1 − price` for a requester sell. The fee is the [combo taker fee](/fees.md#combo-taker-fees) for that quantity, rounded to the cent the same way the exchange charges it. For a sell, the fee curve is evaluated at `1 − price`.

For example, a \$10.00 cash RFQ quoted to buy at `0.1296` sizes to 70.44 contracts:

| | Amount |
| - | - |
| 70.44 × \$0.1296 | \$9.13 |
| Combo taker fee | \$0.87 |
| **Total** | **\$10.00** |

70.45 contracts would cost more than \$10.00.

Use the `buyQtyDecimal` and `sellQtyDecimal` reported on the quote instead of recomputing them. The fee actually charged is reported per fill in `commission_notional_collected`. [Taker rebates](/fees.md#taker-rebate-tiers-from-october-19) are paid weekly and do not change the fee charged on the fill.

## RFQ Orders on Drop Copy

**Which orders does accepting a quote create?**

After the maker confirms, the exchange submits two ordinary combo orders at the selected price and quantity: the maker's order first, then yours. Both appear on Drop Copy like any other order on your account.

**What `clord_id` does my order carry?**

The exchange generates it. RFQ-originated orders have a `clord_id` beginning with `rfq1.`; treat the rest as opaque. The value is deterministic for a given quote and side, so retrying `AcceptQuote` cannot create a second order. The `quote_executed` event delivered to you carries your order's `client_order_id`. The public `Quote` does not include client order IDs.

**Is the execution's `order.id` the quote's `rfqCreatorOrderId`?**

Yes. `rfqCreatorOrderId` is the exchange order ID of your order, and `creatorOrderId` is the maker's.

**Can executions arrive before `GetQuotes` shows `QUOTE_STATUS_EXECUTED`?**

Yes. The quote moves to `QUOTE_STATUS_EXECUTED` and records both order IDs after both orders have been submitted. Your order can match immediately on submission, so Drop Copy can deliver its executions before the quote shows the order IDs. Don't drop executions for an order you can't yet match to a quote. Hold them and match again once `rfqCreatorOrderId` is available, or match on the `rfq1.` prefix and the combo symbol.

**With `restRemainder: false`, does my order fill in full in one execution?**

Not necessarily. With `restRemainder: false` your order is immediate-or-cancel, not fill-or-kill. It is a normal order on the combo's order book, so it can:

* fill in full against the maker's order
* fill across several executions, against the maker's order and other resting orders at the same or a better price
* fill partially, with the remainder canceled
* not fill at all

With `restRemainder: true`, any unfilled quantity rests on the book as a good-til-canceled order. In both cases, Drop Copy is the source of truth for what filled. `QUOTE_STATUS_EXECUTED` means the orders were submitted; it does not mean they filled.

## Settlement and Positions

**How does a combo settle?**

A combo settles on its own symbol, the same way a regular instrument does, and its settlement price is published on that symbol. Read it with [`GET /v1/instruments/{symbol}/settlement`](/institutional/settlement/overview), which also returns the combo's `priceScale`. The legs keep their own settlements. Each leg's value is:

* its settlement price for a `SIDE_BUY` leg
* `1 − settlement price` for a `SIDE_SELL` leg

The combo settles at the product of those values. A leg that cannot resolve settles at its last fair market price, and the combo's value is multiplied by that price. See the [Combos FAQs](/faqs/combos-faqs.md#how-does-the-payout-work-out-in-practice) for worked examples.

**Does a combo settle as soon as one leg loses?**

Yes. Once any leg settles against its side, the combo's value is fixed at \$0, and it settles without waiting for the remaining legs. Otherwise it settles after every leg has a final settlement.

**Do combo positions appear in account positions?**

Yes. A combo position is reported under its combo symbol through the [Positions API](/trader-guide/positions-risk.md), like any other instrument.

## Leg Combinations

**Can I combine legs from the same game?**

Yes. Legs on the same game or event are allowed, including a spread with the moneyline, as long as the set is possible and not redundant.

**Which leg sets are rejected?**

`CreateCombo` rejects a set of legs that:

* has fewer than 2 legs or more than the maximum, or repeats a symbol
* includes a leg that is not open and tradable, or whose market is not eligible for combos
* cannot all settle as selected, for example buying two outcomes of the same mutually exclusive market, or a winner, spread, and total combination that no final score satisfies
* contains a redundant leg, one already implied by another leg, for example buying a team's spread and the same team to win

These rejections return `INVALID_ARGUMENT` (HTTP `400`) with a message describing the first problem found:

| Message | Meaning |
| - | - |
| `legs [..] cannot all settle as selected` | The legs are mutually incompatible. |
| `legs[i] is already covered by legs[j]` | One leg implies another. Remove the redundant leg. |
| `legs[i] and legs[j] share symbol` | Duplicate symbol. |

Separately, `RESOURCE_EXHAUSTED` with `weekly combo creation limit reached` means your participant has used its [weekly combo creation quota](/institutional/combos/overview.md).

**Is there a way to validate legs before creating a combo?**

Not currently. Call `CreateCombo` and handle `INVALID_ARGUMENT`. Creating a combo that already exists returns the existing symbol and does not count toward the weekly quota.

## Related Documentation

> **[Combos/RFQ Guide](/trader-guide/combos.md)**
>
> Maker workflow, quote rules, and last look

> **[RFQ API](/institutional/rfqs/overview.md)**
>
> RFQ and quote REST and unary gRPC contract

> **[Fee Schedule](/fees.md#combo-taker-fees)**
>
> Combo taker fee curve and rounding

> **[Drop Copy](/streaming-endpoints/dropcopy-stream.md)**
>
> Exchange order and fill reconciliation


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.