> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Self-Match Prevention

The Polymarket US offers self-match prevention logic which can be enabled either at the FIX session level (automatically applied to all orders entered through a session), or on a per-order basis using the SelfMatchPreventionID (7928) and SelfMatchPreventionInstruction (8000) tags.

This instruction will automatically cancel one or both orders (without execution) which would potentially be involved in a self-match. The options are:

1. The aggressor (new) order will be canceled.
2. The passive (existing) order is canceled.

Contact the exchange operator to enable the setting at the FIX session level.

## How Self-Match Prevention Works

Orders may have self-match prevention enabled at either the FIX session level, or at an order-level basis using tags SelfMatchPreventionID (7928) and SelfMatchPreventionInstruction (8000).

Where specified, two otherwise-executable orders from the same participant and which carry the same SelfMatchPreventionID (7928) will be prevented from matching by expiring one of the orders. Whether the resting or aggressive order is canceled is governed by SelfMatchPreventionInstruction (8000) of the incoming order.

### Figure 8: Self-match prevention expires the oldest order to prevent self-trading

<br />

![](https://files.readme.io/ff5ba39-selfmatch.png)

<br />

Note that resting order(s) will expire just after the incoming order has been accepted by the Platform, and before any trades have taken place. The incoming order is therefore permitted to trade against other orders in the order book as it entered the market.

**Example 13: ExecutionReport indicating resting order expiry as a result of self-match prevention**

```
8=FIXT.1.1 | 9=341 | 35=8 | 34=69 | 49=TARGET | 52=20240521-11:22:26.078209896 | 56=SENDER | 57=SENDERSUB | 1=ACCT | 6=0.00 | 11=1886428747 | 14=0 | 17=1HPT7DQ1GC4JA | 22=8 | 31=0.00 | 32=0 | 37=1HQ4A5T0EDM26 | 38=1 | 39=4 | 40=2 | 41=1886428747 | 44=0.02 | 48=GOOG | 54=1 | 55=GOOG | 58=Self Match Prevention | 59=0 | 60=20240521-11:22:26.075068980 | 99=0.00 | 150=4 | 151=0 | 378=99 | 581=3 | 582=1 | 7928=111 | 8000=O | 10=039 |
```

If the SelfMatchPreventionInstruction (8000) is N (newest), then it is the incoming order which is rejected to prevent the execution, as shown below. This is the default behavior where SelfMatchPreventionID (7928) is present but SelfMatchPreventionInstruction (8000) is not specified.

Note that the incoming order is fully canceled in the case it would potentially match against other orders with the same SelfMatchPreventionID (7928); partial execution against other orders is not permitted.

### Figure 9: Self-match prevention causes newest order to be rejected

<br />

![](https://files.readme.io/f39184350c03a8ce8bca9bc6aa9799e5a75e95bf388b74e00311fa475f083dad-figure9.jpeg)

<br />

**Example 14: ExecutionReport immediately rejecting incoming order as a result of self-match prevention**

```
8=FIXT.1.1 | 9=314 | 35=8 | 34=109 | 49=TARGET | 52=20240521-11:55:30.495116582 | 56=SENDER | 57=SENDERSUB | 1=ACCT | 6=0.00 | 11=1886428755 | 14=0 | 17=1HPT7DQ1GC4JT | 22=8 | 31=0.00 | 32=0 | 37=1HQ4A5T0EDM2E | 38=10 | 39=8 | 40=2 | 44=0.02 | 48=GOOG | 54=1 | 55=GOOG | 58=Self Match Prevention | 59=0 | 60=20240521-11:55:30.487845738 | 99=0.00 | 103=0 | 150=8 | 151=0 | 581=3 | 582=1 | 7928=222 | 10=165 |
```

<br />
