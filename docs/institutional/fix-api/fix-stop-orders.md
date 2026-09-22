> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Stop Orders

## Triggering Stop Orders

Stop Orders which have been accepted by the Platform are immediately acknowledged with an ExecutionReport \[8] message indicating OrdStatus (39) = 0 (New).

They remain outside the central limit order book until the StopPx (99) has been observed, triggering the release of either a Limit or Market-to-Limit order into the order book. At this point, the Platform will send a second, unsolicited Execution Report \[8] with a matching OrderID (37) value, and the OrdType (40) of either 2 (Limit) or K (market-to-limit). The OrdStatus (39) of this triggered order will be 0 (New).

### Figure 6: Triggering of Stop Limit order

![](https://files.readme.io/4350afd-StopLimit.png)

<br />

**Example 9: Entry of a Stop Limit order**

```
8=FIXT.1.1 | 9=160 | 35=D | 49=SENDER | 56=TARGET | 34=119 | 52=20240521-09:45:21 | 11=1886428727 | 21=1 | 55=GOOG | 54=1 | 60=20240521-09:45:21 | 40=4 | 44=0.03 | 38=1500 | 50=SENDERSUB | 1=ACCT | 59=0 | 99=0.03 | 10=163 |
```

**Example 10: Initial acknowledgement of Stop Limit order**

```
8=FIXT.1.1 | 9=279 | 35=8 | 34=112 | 49=TARGET | 52=20240521-09:45:21.252049258 | 56=SENDER | 57=SENDERSUB | 1=ACCT | 6=0.00 | 11=1886428727 | 14=0 | 17=1HPT7DQ1GC4C4 | 22=8 | 31=0.00 | 32=0 | 37=1HQ4A5T0EDM1T | 38=1500 | 39=0 | 40=4 | 44=0.03 | 48=GOOG | 54=1 | 55=GOOG | 59=0 | 60=20240521-09:45:21.246689976 | 99=0.03 | 150=0 | 151=1500 | 581=3 | 582=1 | 10=079 |
```

**Example 11: ExecutionReport indicating conversion of Stop Limit into Limit order**

```
8=FIXT.1.1 | 9=293 | 35=8 | 34=126 | 49=TARGET | 52=20240521-09:52:30.011976583 | 56=SENDER | 57=SENDERSUB | 1=ACCT | 6=0.00 | 11=1886428732 | 14=0 | 17=1HPT7DQ1GC4ET | 22=8 | 31=0.00 | 32=0 | 37=1HQ4A5T0EDM1T | 38=1500 | 39=0 | 40=2 | 41=1886428727 | 44=0.03 | 48=GOOG | 54=1 | 55=GOOG | 59=0 | 60=20240521-09:52:30.004561670 | 99=0.02 | 150=0 | 151=1500 | 581=3 | 582=1 | 10=253 |
```

## Market-To-Limit Order Behavior

Market-to-limit orders (OrderType (39) = K) are unpriced orders which are designed to execute against any existing orders in the order book upon arrival, with any remaining order balance automatically converted into a Limit order at the last trade or "worst fill" price.

To illustrate this behavior, consider the below order book:

![](https://files.readme.io/c36a61b-orderbook1.png)

When a new Market-to-Limit order selling 1,800 hits the order book, then the order will immediately trade 1,000 shares at 10.03, and a further 500 shares at 10.02. Since there are no further bids, the Platform will place the remaining 300 shares into the order book at a price equal to the last fill price of 10.02.

![](https://files.readme.io/1be3696-orderbook2.png)

### Figure 7: Handling of Market-to-Limit order (see example)

<br />

![](https://files.readme.io/10ea2fc-mkt_to_limit.png)

<br />

Note that unlike Stop Orders, Market-to-Limit orders retain the same OrdType (40) of K (Market-to-limit) throughout their life; the initial acknowledgement contains the limit Price (44) of the resting order.

<br />

**Example 12: Initial acknowledgment of Market-to-Limit order indicating end Limit Price (44)**

```
8=FIXT.1.1 | 9=278 | 35=8 | 34=11 | 49=TARGET | 52=20240521-10:40:28.546598320 | 56=SENDER | 57=SENDERSUB | 1=ACCT | 6=0.00 | 11=1886428739 | 14=0 | 17=1HPT7DQ1GC4GH | 22=8 | 31=0.00 | 32=0 | 37=1HQ4A5T0EDM20 | 38=1000 | 39=0 | 40=K | 44=0.02 | 48=GOOG | 54=2 | 55=GOOG | 59=0 | 60=20240521-10:40:28.542693638 | 99=0.00 | 150=0 | 151=1000 | 581=3 | 582=1 | 10=012 |
```

<br />
