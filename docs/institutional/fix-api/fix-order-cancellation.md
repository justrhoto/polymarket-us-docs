> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Order Cancellation

Participants may request to cancel any open order using the OrderCancelRequest \[F] message.

As with order amend requests, the order to be canceled is identified using the last-entered ClOrdID (11) value relating to the order into the OrigClOrdID (41) field.

If the order has been canceled, the Polymarket US will respond with an ExecutionReport \[8] message which echoes many of the key (updated) order attributes, and with ExecType (150) = 4 (canceled).

## Table 18: OrderCancelRequest (F) message

<table>
  <thead>
    <tr>
      <th width="80">Tag</th>
      <th width="200">Name</th>
      <th width="50">Req</th>
      <th width="100">Type</th>
      <th>Description</th>
    </tr>
  </thead>

  <tbody>
    <tr><td>\< Standard Header ></td><td /><td>Y</td><td /><td>35 = F</td></tr>
    <tr><td>11</td><td>ClOrdID</td><td>Y</td><td>String</td><td>Fresh, participant-generated, unique reference for this OrderCancelRequest. Must be different from the original ClOrdID (11) for the order.</td></tr>
    <tr><td>41</td><td>OrigClOrdID</td><td>Y</td><td>String</td><td>The last (participant-generated) ClOrdID (11) reference for the order. This might be from the original NewOrderSingle or prior amends.</td></tr>
    <tr><td>55</td><td>Symbol</td><td>Y</td><td>String</td><td>Instrument symbol as indicated on the order.</td></tr>
    <tr><td>\< Standard Trailer ></td><td /><td>Y</td><td /><td /></tr>
  </tbody>
</table>

<br />

If the request to cancel the order passed validation, then the Polymarket US will acknowledge the order cancellation with an ExecutionReport \[8] message indicating OrdStatus (39) = 4 (canceled), and LeavesQty (151) = 0.

## Figure 12: Successful cancelation of existing order

![](https://files.readme.io/4964694-order_cancel.png)

**Example 16: Example of order cancel message**

```
8=FIXT.1.1 | 9=107 | 35=F | 49=SENDER |  56=TARGET | 34=96 | 52=20240517-19:29:50 | 50=SENDERSUB | 41=1182560834 | 11=1182560840 | 55=GOOG | 54=1 | 10=244 |
```

Rejected attempts to cancel orders for any reason (for example order is no longer alive) are rejected using the OrderCancelReject \[9] message, which identifies the reason for the rejection.

## Table 19: OrderCancelReject (9) message

<table>
  <thead>
    <tr>
      <th width="80">Tag</th>
      <th width="200">Name</th>
      <th width="50">Req</th>
      <th width="100">Type</th>
      <th>Description</th>
    </tr>
  </thead>

  <tbody>
    <tr><td>\< Standard Header ></td><td /><td>Y</td><td /><td>35 = 9</td></tr>
    <tr><td>11</td><td>ClOrdID</td><td>Y</td><td>String</td><td>Echoed from the OrderCancelRequest</td></tr>
    <tr><td>37</td><td>OrderID</td><td>Y</td><td>String</td><td>Will be 'NONE' for unknown orders</td></tr>
    <tr><td>39</td><td>OrdStatus</td><td>Y</td><td>char</td><td>Status of the cancellation request. 8=Rejected</td></tr>
    <tr><td>41</td><td>OrigClOrdID</td><td>Y</td><td>String</td><td>Echoed from the OrderCancelRequest</td></tr>
    <tr><td>58</td><td>Text</td><td>Y</td><td>String</td><td>Free text string providing additional rejection reason</td></tr>
    <tr><td>102</td><td>CxlRejReason</td><td>Y</td><td>int</td><td>Reason for the rejection. 0=Too late to cancel, 1=Unknown order, 6=Duplicate ClOrdID, 18=Invalid price increment (tick size), 99=Other</td></tr>
    <tr><td>434</td><td>CxlRejResponseTo</td><td>Y</td><td>char</td><td>1=Order cancel request, 2=Order amend request</td></tr>
    <tr><td>\< Standard Trailer ></td><td /><td>Y</td><td /><td /></tr>
  </tbody>
</table>

<br />

## Figure 13: Unsuccessful attempt to cancel existing order

![](https://files.readme.io/401042e-unsuccessful_cancel.png)

<br />

**Example 17: Rejection of an unsuccessful cancel attempt**

```
8=FIXT.1.1 | 9=145 | 35=9 | 34=91 | 49=TARGET | 52=20240521-09:26:30.378549737 | 56=SENDER | 57=SENDERSUB | 11=1886428723 | 37=NONE | 39=8 | 41=1886428676 | 58=Unknown order | 102=1 | 434=1 | 10=198 |
```
