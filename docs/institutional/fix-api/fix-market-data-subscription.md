> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Market Data Subscription

The market data sessions for the Polymarket US are available by a second, separate FIX gateway; they are not accessible via the order-entry session.

When displaying the order book, the Polymarket US provides a Market-by-Order view; i.e each order is displayed individually with a corresponding timestamp (used to determine time priority within a price level). Each order also carries the unique OrderID reference, which Participants can use to identify their own orders in market data.

## Subscribing to Market Data

Participants can subscribe to market data for a given symbol using a MarketDataRequest \[V] message.

## Table 20: MarketDataRequest (V) message

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
    <tr><td>\< Standard Header ></td><td /><td>Y</td><td /><td>35 = V</td></tr>
    <tr><td>262</td><td>MDReqID</td><td>Y</td><td>String</td><td>Unique ID for this request</td></tr>
    <tr><td>263</td><td>SubscriptionRequestType</td><td>Y</td><td>char</td><td>Type of subscription requested (0=Snapshot, 1=Snapshot plus Updates, 2=Delete previous request/unsubscribe)</td></tr>
    <tr><td>264</td><td>MarketDepth</td><td>Y</td><td>int</td><td>Depth requested, maximum 25 levels (0=Full book depth, 1=Top of book/best prices only, 2+=Number of levels requested)</td></tr>
    <tr><td>267</td><td>NoMDEntryTypes</td><td>N</td><td>NumInGroup</td><td /></tr>
    <tr><td>→269</td><td>MDEntryType</td><td>N</td><td>char</td><td>A repeating group of MD Entry Types requested (0=Bid, 1=Offer, 2=Trade, 4=Opening Price, 5=Closing Price, 6=Settlement Price, 7=Trading Session High Price, 8=Trading Session Low Price, B=Trade Volume, g=Trading Reference Price)</td></tr>
    <tr><td>146</td><td>NoRelatedSym</td><td>Y</td><td>NumInGroup</td><td>Number of symbols requested</td></tr>
    <tr><td>→55</td><td>Symbol</td><td>Y</td><td>String</td><td>Instrument symbol.</td></tr>
    <tr><td>\< Standard Trailer ></td><td /><td>Y</td><td /><td /></tr>
  </tbody>
</table>

If the MarketDataRequest \[V] message is valid, Polymarket US will respond with a single MarketDataSnapshotFullRefresh \[W] message for each requested Instrument, providing details of all orders in the order book (all levels as a repeating group within a single message). Note that the (repeating) MDEntryType (269) field can be specified if required to tailor the elements returned.

**Example 18:** Request a snapshot of all market data elements using MarketDataRequest \[V] message

```
8=FIXT.1.1 | 9=92 | 35=V | 49=SENDER | 56=TARGET | 34=4 | 52=20240517-19:05:47 | 262=MD-REQ-001 | 263=1 | 264=3 | 146=1 | 55=GOOG | 10=075 |
```

Note that since the Polymarket US returns market data split by order, requesting only the best price using MarketDepth (264) = 1 (Top of book) may still return multiple bid and offer entries if there is more than one order at this price.

## Table 21: MarketDataSnapshotFullRefresh (W) message

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
    <tr><td>\< Standard Header ></td><td /><td>Y</td><td /><td>35 = W</td></tr>
    <tr><td>22</td><td>SecurityIDSource</td><td>Y</td><td>int</td><td>8 = Exchange symbol</td></tr>
    <tr><td>48</td><td>SecurityID</td><td>Y</td><td>String</td><td>Will always equal Symbol (55)</td></tr>
    <tr><td>55</td><td>Symbol</td><td>Y</td><td>String</td><td>Instrument symbol</td></tr>
    <tr><td>167</td><td>SecurityType</td><td>N</td><td>String</td><td>EVENT=Event contract. Currently, Polymarket only offers EVENT instruments.</td></tr>
    <tr><td>262</td><td>MDReqID</td><td>Y</td><td>String</td><td>The ID of the request as indicated on the request.</td></tr>
    <tr><td>292</td><td>Corporate Action</td><td>C</td><td>char</td><td>Provided if the instrument is currently subject to a Corporate Action (A-W codes)</td></tr>
    <tr><td>268</td><td>NoMDEntries</td><td>Y</td><td>NumInGroup</td><td>The number of market data levels returned. Might be zero if the symbol is valid but there are currently no bids/offers in this symbol.</td></tr>
    <tr><td>→ 269</td><td>MDEntryType</td><td>Y</td><td>char</td><td>Type of entry (0=Bid, 1=Offer, 2=Trade, 4=Opening Price, 5=Closing Price, 6=Settlement Price, 7=Trading Session High Price, 8=Trading Session Low Price, B=Trading Session Volume, g=Trading Reference Price)</td></tr>
    <tr><td>→ 270</td><td>MDEntryPx</td><td>Y</td><td>Price</td><td>Price level</td></tr>
    <tr><td>→ 271</td><td>MDEntrySize</td><td>C</td><td>Qty</td><td>Quantity of the individual order or trade, or the aggregate quantity where MDEntryType (269) = B (Trading Session Volume). Not sent for session open/high/low.</td></tr>
    <tr><td>→ 272</td><td>MDEntryDate</td><td>Y</td><td>UTCDateOnly</td><td>Time priority (date) of the order.</td></tr>
    <tr><td>→ 273</td><td>MDEntryTime</td><td>Y</td><td>UTCTimeOnly</td><td>Time priority (time) of the order.</td></tr>
    <tr><td>→ 336</td><td>TradingSessionID</td><td>C</td><td>String</td><td>Sent for entries other than MDEntryType (269) = 0 (Bid) or 1 (Offer): CLOSED, OPEN, PREOPEN, SUSPENDED, EXPIRED, TERMINATED, HALTED, MATCH\_AND\_CLOSE\_AUCTION</td></tr>
    <tr><td>→ 1151</td><td>SecurityGroup</td><td>C</td><td>String</td><td>The name of the group of related securities to which this instrument belongs.</td></tr>
    <tr><td>→ 1070</td><td>MDQuoteType</td><td>C</td><td>int</td><td>Identifies market data quote type. Only sent for MDEntryType (269) = 4 (Opening Price). 0 = Indicative</td></tr>
    <tr><td>→ 59</td><td>TimeInForce</td><td>C</td><td>char</td><td>Sent for MDEntryType (269) = 0 (Bid) or 1 (Offer). The time in force for this order (0=Good for day, 1=Good till cancel, 6=Good till date)</td></tr>
    <tr><td>→ 37</td><td>OrderID</td><td>C</td><td>String</td><td>Sent for MDEntryType (269) = 0 (Bid) or 1 (Offer). Matches the order ID in the ExecutionReport \[8] acknowledgement, allowing Participants to identify their own orders within market data. Typically a 13-character alphanumeric string.</td></tr>
    <tr><td>→ 278</td><td>MDEntryID</td><td>C</td><td>String</td><td>Sent for MDEntryType (269) = 0 (Bid) or 1 (Offer). Unique reference for the entry. Typically 13-character alphanumeric string.</td></tr>
    <tr><td>→ 40</td><td>OrdType</td><td>C</td><td>char</td><td>Sent for MDEntryType (269) = 0 (Bid) or 1 (Offer).</td></tr>
    <tr><td>→ 126</td><td>ExpireTime</td><td>N</td><td>UTCTimestamp</td><td>Sent for MDEntryType (269) = 0 (Bid) or 1 (Offer) where the order has ExpiryTime (126) set.</td></tr>
    <tr><td>\< Standard Trailer ></td><td /><td>Y</td><td /><td /></tr>
  </tbody>
</table>

**Example 19:** Initial Market Data Snapshot (five repeating groups color-coded)

```
8=FIXT.1.1 | 9=458 | 35=W | 34=79 | 49=TARGET | 52=20240521-09:45:49.860198821 | 56=SENDER | 22=8 | 48=GOOG | 55=GOOG | 167=NONE | 262=1552371733 | 268=5 | 269=2 | 270=0.00 | 271=1499 | 272=20240521 | 273=09:06:39.324891684 | 336=OPEN | 269=4 | 270=3.00 | 272=20240515 | 273=21:24:03.898604733 | 336=OPEN | 1070=1 | 269=7 | 270=50.00 | 272=20240517 | 273=19:06:47.977567695 | 336=OPEN | 269=8 | 270=0.00 | 272=20240521 | 273=09:06:39.324891684 | 336=OPEN | 269=B | 270=93544.40 | 271=23645 | 272=20240521 | 273=09:06:39.324891684 | 336=OPEN | 1151=Equities | 10=199 |
```

Note the response will contain ONLY a snapshot of the current order book; it does not contain information about historic trades that have occurred on the platform.

### Figure 14: Successful market data subscription with snapshot and incremental updates

![](https://files.readme.io/9536423-market_refresh.png)
