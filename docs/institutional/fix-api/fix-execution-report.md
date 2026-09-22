> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# ExecutionReport

<br />

The ExecutionReport \[8] message is used to acknowledge various order lifecycle events including the acceptance, rejection, and expiry of orders, as well as providing details of matches (fills) against orders.

<br />

All orders entering the Platform are first either accepted or rejected using an Execution Report \[8]. The order may then receive further Execution Reports \[8] as necessary given their marketability and TimeInForce (59) constraints. For example:

1. A badly-formatted order which fails validation upon entry will receive an ExecutionReport \[8] with OrdStatus (39) = 8 (Rejected).
2. A good for day order which is not immediately executable will receive an ExecutionReport \[8] with OrdStatus (39) = 0 (New). Should it receive executions during the course of the day, then these will be notified in subsequent Execution Report \[8] messages with OrdStatus (39) = 1 (Partially Filled) and/or 2 (Fully Filled).
3. An order with TimeInForce (59) = 6 (good till time) will receive an ExecutionReport \[8] with OrdStatus (39) = 0 (New) upon entry. If it remains unexecuted, it will expire at the indicated ExpireTime (126) with an Execution Report \[8] message with OrdStatus (39) = C (Expired).
4. A Fill Or Kill order with TimeInForce (59) = 4 which can not be fully executed will first receive an ExecutionReport \[8] with OrdStatus (39) = 0 (New) and then an immediate Execution Report \[8] message with OrdStatus (39) = C (Expired).
5. An order with TimeInForce (59) = 3 (immediate or cancel) which can be partially filled upon entry will receive at least three ExecutionReport \[8] messages; the first will indicate OrdStatus (39) = 0 (New), the next messages will detail the fill(s), and the final Execution Report \[8] message will expire the remainder with OrdStatus (39) = C (Expired).

## Table 16: ExecutionReport (8) message

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
    <tr><td>\< Standard Header ></td><td /><td>Y</td><td /><td>35 = 8</td></tr>
    <tr><td>1</td><td>Account</td><td>N</td><td>String</td><td>Account reference if indicated on the original order</td></tr>
    <tr><td>6</td><td>AvgPx</td><td>Y</td><td>Price</td><td>Volume-weighted average price of all trades against this order. May be zero for unexecuted orders.</td></tr>
    <tr><td>11</td><td>ClOrdID</td><td>Y</td><td>String</td><td>The participant-assigned ClOrdID value as sent on the last order action message form the Participant (new order, amendment or cancel).</td></tr>
    <tr><td>12</td><td>Commission</td><td>N</td><td>Amt</td><td>Commission amount charged on this fill. Present on trades only.</td></tr>
    <tr><td>13</td><td>CommType</td><td>N</td><td>char</td><td>Commission calculation method. 3=Absolute (total dollar amount)</td></tr>
    <tr><td>14</td><td>CumQty</td><td>Y</td><td>Qty</td><td>Cumulative quantity so far for this order. May be zero for unexecuted orders.</td></tr>
    <tr><td>17</td><td>ExecID</td><td>Y</td><td>String</td><td>Unique identifier for the Execution Report as assigned by Polymarket US. Typically a 13-character alphanumeric string.</td></tr>
    <tr><td>22</td><td>SecurityIDSource</td><td>Y</td><td>String</td><td>Identifies source of SecurityID (48) value. 8=Exchange symbol</td></tr>
    <tr><td>31</td><td>LastPx</td><td>Y</td><td>Price</td><td>Price of this last fill. Will be zero for messages not relating to a trade.</td></tr>
    <tr><td>32</td><td>LastQty</td><td>Y</td><td>Qty</td><td>Quantity traded on this last fill. Will be zero for messages not relating to a trade.</td></tr>
    <tr><td>37</td><td>OrderID</td><td>Y</td><td>String</td><td>Unique identifier for Order as assigned by Polymarket US. Typically a 13-character alphanumeric string.</td></tr>
    <tr><td>38</td><td>OrderQty</td><td>Y</td><td>Qty</td><td>Total order quantity (amended as necessary)</td></tr>
    <tr><td>39</td><td>OrdStatus</td><td>Y</td><td>char</td><td>The latest status of the order after any changes have been applied. 0=New, 1=Partially filled, 2=Fully filled, 4=Canceled, 8=Rejected, C=Expired</td></tr>
    <tr><td>40</td><td>OrdType</td><td>Y</td><td>char</td><td>The type of order. 2=Limit, 3=Stop, 4=Stop Limit, K=Market with left over as limit</td></tr>
    <tr><td>41</td><td>OrigClOrdID</td><td>N</td><td>String</td><td>Sent in the case of order amendment or cancellation. References the prior ClOrdID (11) value that the action amended/canceled.</td></tr>
    <tr><td>44</td><td>Price</td><td>Y</td><td>Price</td><td>Order limit price (amended as necessary)</td></tr>
    <tr><td>48</td><td>SecurityID</td><td>Y</td><td>String</td><td>Security identifier; will always match Symbol (55).</td></tr>
    <tr><td>54</td><td>Side</td><td>Y</td><td>char</td><td>1=Buy, 2=Sell</td></tr>
    <tr><td>55</td><td>Symbol</td><td>Y</td><td>String</td><td>Instrument symbol</td></tr>
    <tr><td>460</td><td>Product</td><td>Y</td><td>Int</td><td>Indicates the type of product the security is associated with. 1=AGENCY, 2=COMMODITY, 3=CORPORATE, 4=CURRENCY, 5=EQUITY, 6=GOVERNMENT, 7=INDEX, 8=LOAN, 9=MONEYMARKET, 10=MORTGAGE, 11=MUNICIPAL, 12=OTHER, 13=FINANCING, 14=ENERGY</td></tr>
    <tr><td>59</td><td>TimeInForce</td><td>Y</td><td>char</td><td>Echoed from New Order Single. 0=Good for day, 1=Good till cancel, 3=Immediate or cancel, 4=Fill or kill, 6=Good till date</td></tr>
    <tr><td>60</td><td>TransactTime</td><td>Y</td><td>UTCTime</td><td>Timestamp when the business transaction represented by the message occurred.</td></tr>
    <tr><td>99</td><td>StopPx</td><td>Y</td><td>Price</td><td>Order stop price (amended as necessary). Will be zero for non stop orders.</td></tr>
    <tr><td>103</td><td>OrdRejReason</td><td>N</td><td>int</td><td>Rejection reason (where OrdStatus = Rejected). 0=Broker/Exchange Option, 1=Unknown symbol, 2=Exchange closed (maintenance), 3=Order exceeds limit (price validation), 5=Unknown order, 6=Duplicate order (ClOrdID), 11=Unsupported order characteristic, 12=Surveillance option, 13=Incorrect quantity (lot size), 15=Unknown account (tag 1), 16=Price exceeds current price band, 18=Invalid price increment (tick size), 99=Other</td></tr>
    <tr><td>119</td><td>SettlCurrAmt</td><td>N</td><td>Amt</td><td>Present on trades only. Total amount of this last fill. Equal to LastPx (31) x LastQty (32)</td></tr>
    <tr><td>126</td><td>ExpireTime</td><td>N</td><td>UTCTime</td><td>Order expiry date (amended as necessary).</td></tr>
    <tr><td>150</td><td>ExecType</td><td>Y</td><td>char</td><td>The reason that the Polymarket US sent this Execution Report. 0=New, 4=Canceled, 5=Replaced, 8=Rejected, C=Expired, F=Trade</td></tr>
    <tr><td>151</td><td>LeavesQty</td><td>Y</td><td>Qty</td><td>Remaining, unexecuted quantity left on the order. May be zero for fully filled orders.</td></tr>
    <tr><td>381</td><td>GrossTradeAmt</td><td>N</td><td>Amt</td><td>Present on orders which have been filled. Total amount traded across all fills for this order. Equal to AvgPx (6) x CumQty (38).</td></tr>
    <tr><td>581</td><td>AccountType</td><td>N</td><td>Int</td><td>1=CUSTOMER, 2=NON\_CUSTOMER, 3=HOUSE\_TRADER, 4=FLOOR\_TRADER, 6=NON\_CUSTOMER\_CROSS\_MARGINED, 7=HOUSE\_TRADER\_CROSS\_MARGINED, 8=JOINT\_BACK\_OFFICE, 9=EQUITIES\_SPECIALIST, 10=OPTIONS\_MARKET\_MAKER, 11=OPTIONS\_FIRM\_ACCOUNT, 12=AGGREGATED\_CUSTOMER\_AND\_NON\_CUSTOMER, 13=AGGREGATED\_MULTIPLE\_CUSTOMERS, 14=LIQUIDITY\_PROVIDER, 15=OPERATING, 16=CLEARING\_FUND, 17=FUTURES\_MARKET\_MAKER</td></tr>
    <tr><td>582</td><td>CustOrderCapacity</td><td>N</td><td>Int</td><td>1=OWN\_ACCOUNT, 2=PROPRIETARY\_ACCOUNT, 3=FINANCIAL\_ADVISOR, 4=ALL\_OTHER, 5=RETAIL\_CUSTOMER</td></tr>
    <tr><td>453</td><td>NoPartyIDs</td><td>N</td><td>Int</td><td>Number of PartyID (448), PartyIDSource (447), and PartyRole (452) entries</td></tr>
    <tr><td>→ 448</td><td>PartyID</td><td>N</td><td>String</td><td>Party identifier/code</td></tr>
    <tr><td>→ 447</td><td>PartyIDSource</td><td>N</td><td>char</td><td>D=Proprietary</td></tr>
    <tr><td>→ 452</td><td>PartyRole</td><td>N</td><td>Int</td><td>1=EXECUTING\_FIRM, 3=CLIENT\_ID, 24=CUSTOMER\_ACCOUNT</td></tr>
    <tr><td>828</td><td>TrdType</td><td>N</td><td>int</td><td>Present on trades only. 0=Regular trade</td></tr>
    <tr><td>880</td><td>TrdMatchID</td><td>C</td><td>String</td><td>Always populated for trades. Note that buyer and seller will receive the same value. Will match the TradeID (1003) value on market data updates. Typically a 13-character alphanumeric string.</td></tr>
    <tr><td>1028</td><td>ManualOrderIndicator</td><td>N</td><td>Boolean</td><td>Indicates if the order was initially received manually (as opposed to electronically)</td></tr>
    <tr><td>1057</td><td>AggressorIndicator</td><td>C</td><td>Boolean</td><td>Always populated for trades. Identifies whether this order was the aggressor in the trade.</td></tr>
    <tr><td>378</td><td>ExecRestatementReason</td><td>N</td><td>int</td><td>Indicates that the resting order has been canceled as a result of self-match prevention. 99=Self-match prevention</td></tr>
    <tr><td>110</td><td>MinQty</td><td>N</td><td>Qty</td><td>Minimum required execution quantity for the order (if specified)</td></tr>
    <tr><td>6127</td><td>ConditionTriggerMethod</td><td>N</td><td>int</td><td>The reference price used for triggering the stop order. 2=Last price, 5=Settlement price</td></tr>
    <tr><td>7928</td><td>SelfMatchPreventionID</td><td>N</td><td>String</td><td>Unique identifier for the self-match prevention instruction.</td></tr>
    <tr><td>8000</td><td>SelfMatchPreventionInstruction</td><td>N</td><td>String</td><td>Self-match instruction. O=Cancel oldest (resting) order, N=Cancel newest (aggressive) order</td></tr>
    <tr><td>\< Standard Trailer ></td><td /><td>Y</td><td /><td /></tr>
  </tbody>
</table>

## Figure 5: Simple limit order for 150 is acknowledged, partially filled for 100, and fully filled

![](https://files.readme.io/df29571-ExecutionReport.png)

<br />

**Example 6: Acknowledgement of new limit order to buy 1,000 shares at 50.00**

```
8=FIXT.1.1 | 9=269 | 35=8 | 34=14 | 49=TARGET | 52=20240517-19:00:28 | 56=SENDER | 57=SENDERSUB | 1=ACCT | 6=0.00 | 11=1182560819 | 14=0 | 17=1HPT7DPFMC5KW | 22=8 | 31=0.00 | 32=0 | 37=1HQ4A5T0EDM00 | 38=1000 | 39=0 | 40=2 | 44=50.00 | 48=GOOG | 54=1 | 55=GOOG | 59=0 | 60=20240517-19:00:28.678960817 | 99=0.00 | 150=0 | 151=1000 | 581=3 | 582=1 | 10=088 |
```

**Example 7: Execution of 500 shares at a price of 50.00**

```
8=FIXT.1.1 | 9=338 | 35=8 | 34=33 | 49=TARGET | 52=20240517-19:06:47.985808615 | 56=SENDER | 57=SENDERSUB | 1=ACCT | 6=50.00 | 11=1182560826 | 14=500 | 17=1HPT7DPFMC5M5 | 22=8 | 31=50.00 | 32=500 | 37=1HQ4A5T0EDM07 | 38=500 | 39=2 | 40=2 | 44=50.00 | 48=GOOG | 54=2 | 55=GOOG | 59=0 | 60=20240517-19:06:47.977567695 | 99=0.00 | 119=25000.00 | 150=F | 151=0 | 381=25000.00 | 581=3 | 582=1 | 828=0 | 880=1HPT7DPFMC5M4 | 1057=Y | 10=116 |
```

**Example 8: Expiry of FOK order (without execution)**

```
8=FIXT.1.1 | 9=275 | 35=8 | 34=43 | 49=TARGET | 52=20240517-19:09:23.494862156 | 56=SENDER | 57=SENDERSUB | 1=ACCT | 6=0.00 | 11=1182560830 | 14=0 | 17=1HPT7DPFMC5MB | 22=8 | 31=0.00 | 32=0 | 37=1HQ4A5T0EDM0A | 38=500 | 39=C | 40=2 | 44=50.01 | 48=GOOG | 54=2 | 55=GOOG | 59=4 | 60=20240517-19:09:23.491276593 | 99=0.00 | 150=C | 151=0 | 581=3 | 582=1 | 10=201 |
```
