> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# NewOrderSingle

Participants may place orders into the Polymarket US order book to buy or sell securities using a NewOrderSingle \[D] message.

## Table 15: NewOrderSingle (D) message

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
    <tr><td>\< Standard Header ></td><td /><td>Y</td><td /><td>35 = D</td></tr>
    <tr><td>11</td><td>ClOrdID</td><td>Y</td><td>String</td><td>Unique, participant-created identifier for this Order. Uniqueness must be guaranteed across a session (i.e. between logon and logout), which may span multiple days</td></tr>
    <tr><td>1</td><td>Account</td><td>N</td><td>String</td><td>Account reference as previously advised to the exchange operator</td></tr>
    <tr><td>18</td><td>ExecInst</td><td>N</td><td>MultipleChar</td><td>Instructions for order handling. Note that Price Validity Checks can only be ignored (c) for market-to-limit orders to sell. G=All or None, c=Ignore Price Validity Checks, 6=Participate Don't Initiate</td></tr>
    <tr><td>110</td><td>MinQty</td><td>N</td><td>Qty</td><td>Minimum order quantity that must be executed upon entry (or else the whole order is immediately canceled).</td></tr>
    <tr><td>55</td><td>Symbol</td><td>Y</td><td>String</td><td>Instrument symbol</td></tr>
    <tr><td>460</td><td>Product</td><td>N</td><td>Int</td><td>Indicates the type of product the security is associated with. All current products on Polymarket are Product=12 (OTHER).</td></tr>
    <tr><td>54</td><td>Side</td><td>Y</td><td>char</td><td>1=Buy, 2=Sell</td></tr>
    <tr><td>60</td><td>TransactTime</td><td>N</td><td>UTCTime</td><td>Timestamp of order entry in UTC.</td></tr>
    <tr><td>38</td><td>OrderQty</td><td>Y</td><td>Qty</td><td>Order quantity. Can be a decimal.</td></tr>
    <tr><td>40</td><td>OrdType</td><td>Y</td><td>Char</td><td>Order type (2=Limit, 3=Stop, 4=Stop limit, K=Market with left-over as limit)</td></tr>
    <tr><td>44</td><td>Price</td><td>N</td><td>Price</td><td>Price per share/unit. Required where OrdType (40) = 2 (Limit) or 4 (Stop Limit).</td></tr>
    <tr><td>99</td><td>StopPx</td><td>N</td><td>Price</td><td>Stop price at which to trigger the stop order. Required for OrdType (40) = 3 (Stop) or 4 (Stop Limit). Must be greater than or equal to Price (44) for buy order, or less than or equal to Price (44) for sell orders.</td></tr>
    <tr><td>581</td><td>AccountType</td><td>N</td><td>Int</td><td>Account type codes (1-17)</td></tr>
    <tr><td>582</td><td>CustOrderCapacity</td><td>N</td><td>Int</td><td>Customer order capacity codes (1-5)</td></tr>
    <tr><td>453</td><td>NoPartyIDs</td><td>N</td><td>NumingGroup</td><td>Number of PartyID (448), PartyIDSource (447), and PartyRole (452) entries</td></tr>
    <tr><td>→ 448</td><td>PartyID</td><td>N</td><td>String</td><td>Party identifier/code</td></tr>
    <tr><td>→ 447</td><td>PartyIDSource</td><td>N</td><td>char</td><td>D=Proprietary</td></tr>
    <tr><td>→ 452</td><td>PartyRole</td><td>N</td><td>Int</td><td>1=EXECUTING\_FIRM, 3=CLIENT\_ID, 24=CUSTOMER\_ACCOUNT</td></tr>
    <tr><td>59</td><td>TimeInForce</td><td>N</td><td>char</td><td>0=Good for day \[Default], 1=Good till cancel, 3=Immediate or cancel, 4=Fill or kill, 6=Good till date</td></tr>
    <tr><td>126</td><td>ExpireTime</td><td>N</td><td>UTCTime</td><td>Order expiry date and time for orders where TimeInForce = Good Till Date</td></tr>
    <tr><td>1028</td><td>ManualOrderIndicator</td><td>N</td><td>Boolean</td><td>Indicates if the order was initially received manually (as opposed to electronically)</td></tr>
    <tr><td>6127</td><td>ConditionTriggerMethod</td><td>N</td><td>int</td><td>The reference price used to trigger the stop order. Applicable to Stop orders only. 2=Last price \[Default], 5=Settlement price. Settlement price may be the preferred trigger method for markets where settlement price is updated frequently from a price oracle.</td></tr>
    <tr><td>7928</td><td>SelfMatchPreventionID</td><td>N</td><td>String</td><td>Unique identifier to be returned in the case of a self-match prevention cancellation. The same ID must be present on all orders where self-match prevention is desired.</td></tr>
    <tr><td>8000</td><td>SelfMatchPreventionInstruction</td><td>C</td><td>String</td><td>Self-match instruction. O=Cancel oldest (resting) order, N=Cancel newest (aggressive) order</td></tr>
    <tr><td>\< Standard Trailer ></td><td /><td>Y</td><td /><td /></tr>
  </tbody>
</table>

**Example 5: Entry of a new limit order to buy 1,000 shares at 50.00**

```
8=FIXT.1.1 | 9=123 | 35=D | 49=SENDER | 56=TARGET | 34=16 | 50=SENDERSUB | 52=20240517-19:00:28 | 11=1182560819 | 21=1 | 55=GOOG | 54=1 | 40=2 | 44=50 | 38=1000 | 1=ACCT | 10=166 |
```
