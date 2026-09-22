> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Order Entry Overview

## Overview

The Exchange operates as a continuous central limit order book to match orders within the system according to price-time priority:

* Higher-priced orders to buy have priority over lower-priced bids,
* Lower-priced offers to sell buy have priority over higher-priced sells,
* Within a price level, older orders have priority over newer orders,
* Should an existing order increase its quantity (at the same price), it is assigned a new timestamp and therefore loses time priority, but quantity decreases retain time priority.

## Tick Sizes / Minimum Quantity Increments

Each instrument on the Polymarket US has a minimum price increment ("tick size") and minimum quantity increment ("lot size"). These instrument-level settings are indicated in the SecurityList \[y] message in the MinPriceIncrement (969) and MinTradeVol (562) fields respectively.

Order with a price and/or quantity which do not comply with these increments will be rejected using BusinessMessageReject \[j] with reason 13 = Incorrect quantity or 18 = Invalid price increment (tick size).

## Order Types, Time In Force & Execution Instructions

The intended behavior of orders entering the Polymarket US is controlled using a combination of OrderType (40), TimeInForce (59) and ExecInst (18) fields. These are explained in turn below.

### Table 12: OrdType (40) definitions

| Order Type      | Value | Definition                                                                                                                                                                                                                                                                                                                                                                                                           |
| --------------- | ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| LIMIT           | 2     | A priced order that can only trade at a price equal to or better than the price specified.                                                                                                                                                                                                                                                                                                                           |
| MARKET TO LIMIT | K     | An order that fills as far as possible at the best price(s) in the market. Should the order volume exceed that available in the order book, then the remaining order quantity is converted into a Limit order with the price equal to the last fill price (subject to Time In Force instructions).\<br>In the case where there is no market, the order will be rejected with reason "No liquidity for market order". |
| STOP            | 3     | An order which initially enters the system as hidden, but which activates (converts to active) once the price indicated by StopPx (99) is triggered in the market. At this point the order is converted into a Market to Limit order with the indicated quantity.                                                                                                                                                    |
| STOP LIMIT      | 4     | An order similar to STOP, but where the converted order is a Limit order with the indicated Price (44).                                                                                                                                                                                                                                                                                                              |

Looking for a "classic" Market Order? Simply enter a Market-to-Limit order with IOC Time in Force condition.

### Table 13: TimeInForce (59) conditions

| Time In Force             | Value | Definition                                                                                                                                                                                                          |
| :------------------------ | :---- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| DAY                       | 0     | The order remains open for the current trading day only.                                                                                                                                                            |
| GOOD TILL CANCEL (GTC)    | 1     | The order remains available for execution until fully executed or canceled.                                                                                                                                         |
| IMMEDIATE OR CANCEL (IOC) | 3     | The order is immediately executed as far as possible upon entry, with all unfilled quantity expired. Can be used in conjunction with MinQty (110) to specify a minimum quantity which must be executed immediately. |
| FILL OR KILL (FOK)        | 4     | If the entire order quantity can not be satisfied immediately, then the order is canceled in full.                                                                                                                  |
| GOOD TILL DATE (GTD)      | 6     | The trade is active until a specific date and time (expressed in UTC) as indicated in ExpireTime (126).                                                                                                             |

<Warning>
  **DAY orders do not automatically cancel at 5pm during trade day rolls.**

  The Exchange team is working on improving the DAY order types performance. While the Exchange makes improvement, DAY orders will not automatically cancel at 5pm during trade day rolls. Please use GTD orders with the desired timestamp. GTD orders will remain functional with the good-til-time specified.
</Warning>

In addition to order-level Time In force conditions, participants can also specify a minimum order quantity using MinQty (110), which requires that an order receives at least a minimum execution quantity upon entry (possibly in multiple fills). When used in combination with Time In Force, this field offers fine-grained control over the conditions under which an order can participate. For example:

* An order marked as IOC with MinQty (110) of 200 must receive an immediate, minimum trade quantity of 200. If this is not possible, then the entire order immediately expires.
* In the case of orders marked with a FOK TimeInForce (59), MinQty (110) can be included but has no material effect, as the FOK requires a full fill upon entry.
* A Good Till Cancel order with a MinQty (110) specified must trade at least the specified quantity upon first entry into the order book, otherwise the order expires.

Note that MinQty (110) only limits order behavior as it enters the order book; it does not prevent smaller trades occurring against the order once it is resting on the order book.

### Table 14: ExecInst (18) definitions

| Exec Instruction                           | Value | Definition                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| :----------------------------------------- | :---- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ALL OR NONE                                | G     | Require that either (a) all of the order quantity is filled immediately, or (b) none of it should trade even partially. Marking an order with this ExecInst instruction is functionally-equivalent to setting Time In Force to FOK.                                                                                                                                                                                                                                      |
| IGNORE PRICE VALIDITY CHECKS               | c     | Exempt this order from absolute price limits, relative price limits, order size limits, and total notional limits. Only allowed for market-to-limit orders to sell. This flag exists to support quickly liquidating a position.                                                                                                                                                                                                                                          |
| PARTICIPATE DON'T INITIATE                 | 6     | Require that the order is only accepted if it would NOT immediately match. This guarantees that the order will always be the passive side in any trades.  An order that would result in a match would be rejected with reason "Order may participate but not initiate in the market". Should not be used in combination with MinQty (110) or conditions which require immediate executions - ExecInst (18) = G (All or None), or TimeInForce (59) = 3 or 4 (IOC or FOK). |
| SINGLE EXECUTION REQUESTED FOR BLOCK TRADE | j     | A flag for submitting block trades to Polymarket US.                                                                                                                                                                                                                                                                                                                                                                                                                     |
| BEST LIMIT                                 | R     | A flag that if set indicates that the price of a limit order shall be set to the price at the top of the book on the same side as this order.                                                                                                                                                                                                                                                                                                                            |
| IMMEDIATELY EXECUTABLE LIMIT               | T     | A flag that if set indicates that the price of a limit order shall be set to the price at the top of the book on the opposing side as this order, thus able to immediately match.                                                                                                                                                                                                                                                                                        |

<br />
