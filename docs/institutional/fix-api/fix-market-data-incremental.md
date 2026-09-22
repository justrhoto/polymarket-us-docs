> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Incremental Market Data

If the participants subscribed to ongoing updates for the instrument(s), the platform will then start sending unsolicited MarketDataIncrementalRefresh \[X] messages which contain a mixture of trade and/or order book update messages.

These incremental market data messages may contain a repeating group of updates in a single message. For example, an incoming sell order which enters the order book, executes against a resting buy order with the remainder written to the order book will trigger a MarketDataIncrementalRefresh \[X] message containing the following updates:

* The deletion of the previous best bid (as a result of the immediate fill)
* The addition of a new best bid (next-best bid price)
* The deletion of the best offer (new order has a better price)
* The addition of a new best offer (representing the balance of the incoming sell order)
* A record relating to the trade, and
* A record relating to updated overall market volume

## Table 22: MarketDataIncrementalRefresh (X) message

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
    <tr><td>\< Standard Header ></td><td /><td>Y</td><td /><td>35 = X</td></tr>
    <tr><td>262</td><td>MDReqID</td><td>Y</td><td>String</td><td>The ID of the request as indicated on the request</td></tr>
    <tr><td>268</td><td>NoMDEntries</td><td>Y</td><td>NumInGroup</td><td /></tr>
    <tr><td>→ 279</td><td>MDUpdateAction</td><td>Y</td><td>char</td><td>The type of action conveyed by this block (0=New, 1=Change, 2=Delete)</td></tr>
    <tr><td>→ 269</td><td>MDEntryType</td><td>C</td><td>char</td><td>Type of entry. Set where MDUpdateAction (279) = (0) New or 1 (Change). 0=Bid, 1=Offer, 2=Trade, 4=Opening Price, 5=Closing Price, 6=Settlement Price, 7=Trading Session High Price, 8=Trading Session Low Price, B=Trade Volume, g=Trading Reference Price</td></tr>
    <tr><td>→ 278</td><td>MDEntryID</td><td>N</td><td>String</td><td>Unique reference for this entry. Typically a 13-character alphanumeric string.</td></tr>
    <tr><td>→ 55</td><td>Symbol</td><td>Y</td><td>String</td><td>Instrument symbol</td></tr>
    <tr><td>→ 22</td><td>SecurityIDSource</td><td>Y</td><td>int</td><td>8 = Exchange symbol</td></tr>
    <tr><td>→ 48</td><td>SecurityID</td><td>Y</td><td>String</td><td>Will always equal Symbol (55)</td></tr>
    <tr><td>→ 167</td><td>SecurityType</td><td>N</td><td>String</td><td>EVENT=Event contract. Currently, Polymarket only offers EVENT instruments.</td></tr>
    <tr><td>→ 1151</td><td>SecurityGroup</td><td>N</td><td>String</td><td>Security sub-type. For example "Equities"</td></tr>
    <tr><td>→ 270</td><td>MDEntryPx</td><td>N</td><td>Price</td><td>Order level price where MDEntryType (269) = 0 (Bid) or 1 (Offer). Traded price where MDEntryType (269) = 2 (Trade). Total value traded where MDEntryType (269) = B (Trade Volume)</td></tr>
    <tr><td>→ 271</td><td>MDEntrySize</td><td>N</td><td>Qty</td><td>Remaining order size where MDEntryType (269) = 0 (Bid) or 1 (Offer). Will be zero where MDUpdateAction (279) = 2 (Delete). Trade size where MDEntryType (269) = 2 (Trade). Total quantity traded where MDEntryType (269) = B (Trade Volume)</td></tr>
    <tr><td>→ 272</td><td>MDEntryDate</td><td>N</td><td>UTCDateOnly</td><td>The date on which the price level or trade occurred</td></tr>
    <tr><td>→ 273</td><td>MDEntryTime</td><td>N</td><td>UTCTimeOnly</td><td>The time at which the price level updated or trade occurred (in UTC)</td></tr>
    <tr><td>→ 59</td><td>TimeInForce</td><td>N</td><td>char</td><td>Time in force for this order (0=Good for day, 1=Good till cancel, 6=Good till date)</td></tr>
    <tr><td>→ 126</td><td>ExpireTime</td><td>N</td><td>UTCTimestamp</td><td>Populated where TimeInForce (59) = 6 (Good Till Date)</td></tr>
    <tr><td>→ 37</td><td>OrderID</td><td>N</td><td>String</td><td>Only sent for price level updates. Will match OrderID (37) in the ExecutionReport \[8], allowing Participants to identify their own orders within market data.</td></tr>
    <tr><td>→ 40</td><td>OrdType</td><td>N</td><td>char</td><td>2 = Limit order, K = Market-to-limit order</td></tr>
    <tr><td>→ 828</td><td>TrdType</td><td>N</td><td>int</td><td>Only sent for trades. 0 = Regular trade</td></tr>
    <tr><td>→ 1003</td><td>TradeID</td><td>N</td><td>String</td><td>Only sent for trade updates. Will match the ExecID (17) in the ExecutionReport fill, allowing Participants to identify their own trades within market data.</td></tr>
    <tr><td>→ 2446</td><td>AggressorSide</td><td>N</td><td>char</td><td>Only sent for trades. Indicates which side was the aggressor in a trade (1=Buy, 2=Sell)</td></tr>
    <tr><td>→ 336</td><td>TradingSessionID</td><td>C</td><td>String</td><td>Sent for trades and trading status changes. Possible values: CLOSED, OPEN, PREOPEN, SUSPENDED, EXPIRED, TERMINATED, HALTED, MATCH\_AND\_CLOSE\_AUCTION</td></tr>
    <tr><td>\< Standard Trailer ></td><td /><td>Y</td><td /><td /></tr>
  </tbody>
</table>

**Example 20:** Market Data incremental containing multiple updates (repeating groups color-coded)

```
8=FIXT.1.1 | 9=987 | 35=X | 34=87 | 49=TARGET | 52=20240521-09:52:30.013930670 | 56=SENDER | 262=1552371733 | 268=6 | 279=0 | 269=0 | 278=1HQ4A5T0EDM1T | 55=GOOG | 48=GOOG | 22=8 | 167=NONE | 1151=Equities | 270=0.03 | 271=1500 | 272=20240521 | 273=09:52:30.004561670 | 59=0 | 37=1HQ4A5T0EDM1T | 40=2 | 279=0 | 269=1 | 278=1HQ4A5T0EDM1W | 55=GOOG | 48=GOOG | 22=8 | 167=NONE | 1151=Equities | 270=0.03 | 271=15 | 272=20240521 | 273=09:52:30.004561670 | 59=0 | 37=1HQ4A5T0EDM1W | 40=2 | 279=2 | 269=1 | 278=1HQ4A5T0EDM1W | 55=GOOG | 48=GOOG | 22=8 | 167=NONE | 1151=Equities | 270=0.03 | 271=0 | 272=20240521 | 273=09:52:30.004561670 | 59=0 | 37=1HQ4A5T0EDM1W | 40=2 | 279=2 | 269=0 | 278=1HQ4A5T0EDM1V | 55=GOOG | 48=GOOG | 22=8 | 167=NONE | 1151=Equities | 270=0.03 | 271=0 | 272=20240521 | 273=09:52:30.004561670 | 59=0 | 37=1HQ4A5T0EDM1V | 40=2 | 279=0 | 269=2 | 278=1HPT7DQ1GC4DS | 55=GOOG | 48=GOOG | 22=8 | 167=NONE | 1151=Equities | 270=0.03 | 271=15 | 272=20240521 | 273=09:52:30.004561670 | 59=0 | 40=2 | 828=0 | 1003=1HPT7DQ1GC4DS | 2446=2 | 279=0 | 269=B | 55=GOOG | 48=GOOG | 22=8 | 167=NONE | 1151=Equities | 270=93544.85 | 271=23660 | 272=20240521 | 273=09:52:30.004561670 | 336=OPEN | 10=156 |
```

***

## Settlement Outcomes

### Implementation

FIX tag 58 (Text) has been added to the MDIncGrp repeating group to communicate final settlement outcomes. When an instrument resolves with final settlement, the MarketDataIncrementalRefresh (35=X) or MarketDataSnapshotFullRefresh (35=W) message includes the textual outcome.

### Message Structure

When an instrument settles, the message includes:

```
NoMDEntries/0/MDEntryType      | "6"          # Settlement price (269=6)
NoMDEntries/0/MDEntryPx        | <price>      # Settlement price value
NoMDEntries/0/Text             | <outcome>    # NEW: Textual outcome (tag 58)
NoMDEntries/0/TradingSessionID | "EXPIRED"    # Market status (336=EXPIRED)
```

### Usage

**Final Settlement:** Tag 58 is present with the outcome text describing the resolution (e.g., "Pistons", "Bulls", "Over", "Yes").

**Trade Day Roll:** Tag 58 is absent, even when `269=6` is present with `336=CLOSED` or `336=EXPIRED`. Tag 58 only populates when the settlement price and open interest update occur at final settlement, not during initial state transition to EXPIRED.

### Technical Notes

* No data dictionary modifications required - tag 58 already exists in FIX 5.0+ spec for MDIncGrp
* This implementation keeps FIX vanilla/standard-compliant
* Tag 58 is equivalent to the TIER1 field in gRPC settlement\_tiers

**Example:** NBA game settlement where Detroit Pistons win:

```
269=6       # Settlement price entry type
270=1.000   # Settlement price (winning outcome pays $1.00)
58=Pistons  # Textual outcome
336=EXPIRED # Trading session status
```
