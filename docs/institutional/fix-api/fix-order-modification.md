> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Order Modification

<br />

Participants may request to amend any open order using the OrderCancelReplaceRequest \[G] message.

In this case, the order to be amended is identified using the last-entered ClOrdID (11) value relating to the order into the OrigClOrdID (41) field. Following FIX convention, this modification message will also contain a fresh ClOrdID (11) value which can then be used by the Participant to further modify the order if required. Note that the Polymarket US does not require the entry of the (platform-generated) OrderID (37) in order to amend the order.

## Table 17: OrderCancelReplaceRequest (G) message

If the order has been successfully modified, the Polymarket US will respond with an ExecutionReport \[8] message which echoes many of the key (updated) order attributes, and with ExecType (150) = 5 (replaced).

Note that a modification which increases the remaining order quantity will lose its time priority at a price level. Any modifications to reduce order quantity (or other non-price modifications which do not change quantity) will not cause the order to lose their order book priority.

## Figure 10: Successful amend of existing order to adjust OrderQty \[38]

<br />

![](https://files.readme.io/b69c215-order_replace.png)

<br />

**Example 15: Request to replace an existing order**

```
8=FIXT.1.1 | 9=127 | 35=G | 49=SENDER | 56=TARGET| 34=66 | 52=20240517-19:17:08 | 50=SENDERSUB | 41=1182560827 | 11=1182560836 | 55=GOOG | 54=2 | 40=2 | 38=500 | 44=1000 | 10=061 |
```

If the order can not be modified for any reason (for example if the requested price / order size are not acceptable, or the order has already expired), then the Polymarket US will respond with an OrderCancelReject \[9] message indicating the reason.

**Where the amendment has been rejected, the existing order remains working with prior attributes.**

## Figure 11: Unsuccessful amend of existing order to adjust OrderQty \[38]

![](https://files.readme.io/b95417e-order_replace2.png)
