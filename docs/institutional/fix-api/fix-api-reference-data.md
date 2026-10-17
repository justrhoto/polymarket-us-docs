> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# FIX API Reference Data

Participants may download a list of the instruments available (or reference data about them) to trade on Polymarket US by submitting a SecurityListRequest \[x] message.

## Table 23: SecurityListRequest (x) message

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
    <tr><td>\< Standard Header ></td><td /><td>Y</td><td /><td>35 = x</td></tr>
    <tr><td>320</td><td>SecurityReqID</td><td>Y</td><td>String</td><td>Unique ID associated with this request.</td></tr>
    <tr><td>336</td><td>TradingSessionID</td><td>N</td><td>String</td><td>Used to filter for instruments by market state (CLOSED, OPEN, PREOPEN, SUSPENDED, EXPIRED, TERMINATED, HALTED, MATCH\_AND\_CLOSE\_AUCTION). Recommended with SecurityListRequestType (559) = 4: without it the reply includes every expired instrument and is an order of magnitude larger than the OPEN set.</td></tr>
    <tr><td>559</td><td>SecurityListRequestType</td><td>Y</td><td>int</td><td>The type of request being made (0=Individual symbol, 4=All Securities)</td></tr>
    <tr><td>55</td><td>Symbol</td><td>C</td><td>String</td><td>Required if SecurityListRequestType (559) = 0 (individual security)</td></tr>
    <tr><td>263</td><td>SubscriptionRequestType</td><td>N</td><td>char</td><td>Omitted or 0 = snapshot only. 1 = Snapshot + Updates: after the full list, the exchange sends a SecurityDefinitionUpdateReport \[BP] (Table 25) for each instrument that is added (SecurityUpdateAction (980) = A) or terminated (980 = D); other state changes are not sent on this subscription. Supported for SecurityListRequestType (559) = 4 only; a single-symbol subscription is rejected with SecurityRequestResult (560) = 1. The subscription ends at logout. 2 = cancel a Snapshot + Updates subscription.</td></tr>
    <tr><td>\< Standard Trailer ></td><td /><td>Y</td><td /><td /></tr>
  </tbody>
</table>

**Example 21: Request for information on all open securities**

```
8=FIXT.1.1 | 9=84 | 35=x | 49=SENDER | 56=TARGET | 34=12 | 52=20240516-14:28:38 | 320=REF-DATA-001 | 336=OPEN | 559=4 | 10=048 |
```

Upon receipt, Polymarket US responds with one or more SecurityList \[y] messages containing the requested information. The content of each instrument entry does not differ depending on whether an individual symbol was requested or all securities.

**Fragmented replies.** A reply that matches more instruments than fit in one message is split into fragments of up to 1000 instruments. Every fragment carries the SecurityReqID (320) of the request, its own SecurityResponseID (322), the result in SecurityRequestResult (560), the number of instruments in that fragment in NoRelatedSym (146), and LastFragment (893) = N. The final message carries LastFragment (893) = Y. Accumulate the entries across messages for the same SecurityReqID (320) until a message with LastFragment (893) = Y arrives; the exchange does not send a total count. A request for an individual symbol is always answered in a single message with LastFragment (893) = Y. If the exchange cannot complete a reply, the final message carries SecurityRequestResult (560) = 4 (temporary: retry later) or 1 (the request matched more instruments than the session may receive in one reply: request individual symbols or filter with asset attributes) and no instrument entries; anything already delivered for that request is still valid, but the list is incomplete. One all-securities request is served per session at a time; a second one sent before the first reaches LastFragment (893) = Y is answered with SecurityRequestResult (560) = 4.

## Table 24: SecurityList (y) message

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
    <tr><td>\< Standard Header ></td><td /><td>Y</td><td /><td>35 = y</td></tr>
    <tr><td>320</td><td>SecurityReqID</td><td>Y</td><td>String</td><td>The unique SecurityReqID (320) sent on the request.</td></tr>
    <tr><td>322</td><td>SecurityResponseID</td><td>Y</td><td>String</td><td>Unique ID for this response. Typically a 13 character alphanumeric string.</td></tr>
    <tr><td>560</td><td>SecurityRequestResult</td><td>Y</td><td>int</td><td>The status of the request (0=Valid; 1=Invalid/unsupported, also when the request matched more instruments than the session may receive in one reply, so the same request will not succeed; 2=No instruments found that match selection criteria; 3=Not authorized; 4=Instrument data temporarily unavailable, also while another all-securities reply for the session is still in progress, in which case retry after that reply's LastFragment (893) = Y; see Text (58))</td></tr>
    <tr><td>893</td><td>LastFragment</td><td>Y</td><td>Boolean</td><td>N = more SecurityList \[y] messages follow for this SecurityReqID (320); Y = this is the last one. See "Fragmented replies" above.</td></tr>
    <tr><td>58</td><td>Text</td><td>N</td><td>String</td><td>Explanation when SecurityRequestResult (560) is not 0, for example why a request was not completed and how to narrow it.</td></tr>
    <tr><td>146</td><td>NoRelatedSym</td><td>C</td><td>NumInGroup</td><td>Number of instruments in this message (not the total across fragments). 0 when no instruments are returned.</td></tr>
    <tr><td>→ 55</td><td>Symbol</td><td>Y</td><td>String</td><td>Instrument symbol</td></tr>
    <tr><td>→ 48</td><td>SecurityID</td><td>Y</td><td>String</td><td>Will always equal Symbol (55)</td></tr>
    <tr><td>→ 22</td><td>SecurityIDSource</td><td>Y</td><td>int</td><td>8 = Exchange symbol</td></tr>
    <tr><td>→ 167</td><td>SecurityType</td><td>N</td><td>String</td><td>EVENT=Event contract. Currently, Polymarket only offers EVENT instruments.</td></tr>
    <tr><td>→ 231</td><td>ContractMultiplier</td><td>N</td><td>float</td><td>The ratio or multiplier to convert from "nominal" units (e.g. contracts) to total units (e.g. shares). Applicable for Fixed Income, Derivatives, etc.</td></tr>
    <tr><td>→ 864</td><td>NoEvents</td><td>Y</td><td>NumInGroup</td><td>Number of repeating EventType entries. Will always be 1.</td></tr>
    <tr><td>→→ 865</td><td>EventType</td><td>Y</td><td>int</td><td>Code to represent the type of event (5=Activation)</td></tr>
    <tr><td>→→ 866</td><td>EventDate</td><td>Y</td><td>LocalMktDate</td><td>Date that the instrument first started (or will start) trading on the exchange in YYYYMMDD format.</td></tr>
    <tr><td>→→ 868</td><td>EventText</td><td>Y</td><td>String</td><td>Event string. Always 'StartDate'.</td></tr>
    <tr><td>→ 969</td><td>MinPriceIncrement</td><td>Y</td><td>float</td><td>Minimum price increment (tick size)</td></tr>
    <tr><td>→ 1151</td><td>SecurityGroup</td><td>Y</td><td>String</td><td>The name of the group of securities to which this instrument belongs.</td></tr>
    <tr><td>→ 562</td><td>MinTradeVol</td><td>Y</td><td>Qty</td><td>The minimum quantity allowed on an order. This field can be a decimal, indicating the ability to trade fractional shares of this instrument.</td></tr>
    <tr><td>→ 15</td><td>Currency</td><td>Y</td><td>Currency</td><td>Currency for the instrument.</td></tr>
    <tr><td>\< Standard Trailer ></td><td /><td>Y</td><td /><td /></tr>
  </tbody>
</table>

**Example 22: SecurityList \[y] reply in two fragments (color-coded)**

First fragment, more to follow (LastFragment (893) = N):

```
8=FIXT.1.1 | 9=342 | 35=y | 34=9 | 49=TARGET | 52=20240516-14:28:38.864954771 | 56=SENDER | 146=2 | 55=GC-Dec-2030 | 48=GC-Dec-2030 | 22=8 | 167=NONE | 231=1 | 864=1 | 865=5 | 866=19700101 | 868=StartDate | 969=0.01 | 1151=GC | 562=1 | 15=USD | 55=GOOG | 48=GOOG | 22=8 | 167=NONE | 231=1 | 864=1 | 865=5 | 866=19700101 | 868=StartDate | 969=0.01 | 1151=Equities | 562=1 | 15=USD | 320=2007026312 | 322=1HPT7F2AA6404 | 560=0 | 893=N | 10=118 |
```

Final fragment (LastFragment (893) = Y):

```
8=FIXT.1.1 | 9=201 | 35=y | 34=10 | 49=TARGET | 52=20240516-14:28:38.871204113 | 56=SENDER | 146=1 | 55=MSFT | 48=MSFT | 22=8 | 167=NONE | 231=1 | 864=1 | 865=5 | 866=19700101 | 868=StartDate | 969=0.01 | 1151=Equities | 562=1 | 15=USD | 320=2007026312 | 322=1HPT7F2AA6405 | 560=0 | 893=Y | 10=131 |
```

In production a request for all open securities is answered in many fragments of 1000 instruments each; the shape is the same.

## Table 25: SecurityDefinitionUpdateReport (BP) message

Sent on a Snapshot + Updates subscription (SubscriptionRequestType (263) = 1) after the full SecurityList \[y] reply, once for each instrument added to or terminated on the exchange. Added instruments carry the same reference fields as a SecurityList \[y] entry; a termination carries only the instrument's identifiers. Instruments filtered out by the request's asset attributes are not sent.

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
    <tr><td>\< Standard Header ></td><td /><td>Y</td><td /><td>35 = BP</td></tr>
    <tr><td>320</td><td>SecurityReqID</td><td>Y</td><td>String</td><td>The SecurityReqID (320) of the SecurityListRequest \[x] that opened the subscription.</td></tr>
    <tr><td>322</td><td>SecurityResponseID</td><td>Y</td><td>String</td><td>Unique ID for this message.</td></tr>
    <tr><td>980</td><td>SecurityUpdateAction</td><td>Y</td><td>char</td><td>A = Add (a new instrument is available); D = Delete (the instrument is terminated).</td></tr>
    <tr><td>55</td><td>Symbol</td><td>C</td><td>String</td><td>Instrument symbol. Present when SecurityUpdateAction (980) = A.</td></tr>
    <tr><td>48</td><td>SecurityID</td><td>Y</td><td>String</td><td>Equals Symbol (55).</td></tr>
    <tr><td>22</td><td>SecurityIDSource</td><td>Y</td><td>int</td><td>8 = Exchange symbol</td></tr>
    <tr><td>167</td><td>SecurityType</td><td>C</td><td>String</td><td>EVENT = Event contract. Present when 980 = A.</td></tr>
    <tr><td>231</td><td>ContractMultiplier</td><td>C</td><td>float</td><td>Present when 980 = A.</td></tr>
    <tr><td>864</td><td>NoEvents</td><td>C</td><td>NumInGroup</td><td>Number of instrument dates that follow. Present when 980 = A.</td></tr>
    <tr><td>→ 865</td><td>EventType</td><td>C</td><td>int</td><td>5 = Activation (EventText StartDate); 7 = Last eligible trade date (EventText LastTradeDate or ExpirationDate); 6 = Inactivation (EventText TerminationDate).</td></tr>
    <tr><td>→ 866</td><td>EventDate</td><td>C</td><td>LocalMktDate</td><td>Date in YYYYMMDD format.</td></tr>
    <tr><td>→ 1145</td><td>EventTime</td><td>N</td><td>UTCTimestamp</td><td>Time of day for LastTradeDate and ExpirationDate, when set.</td></tr>
    <tr><td>→ 868</td><td>EventText</td><td>C</td><td>String</td><td>StartDate, LastTradeDate, ExpirationDate or TerminationDate.</td></tr>
    <tr><td>969</td><td>MinPriceIncrement</td><td>C</td><td>float</td><td>Minimum price increment (tick size). Present when 980 = A.</td></tr>
    <tr><td>562</td><td>MinTradeVol</td><td>C</td><td>Qty</td><td>The minimum quantity allowed on an order. Present when 980 = A.</td></tr>
    <tr><td>1306</td><td>PriceLimitType</td><td>N</td><td>int</td><td>0 = Price; 2 = Percentage. Present when the instrument has price limits.</td></tr>
    <tr><td>1148</td><td>LowLimitPrice</td><td>N</td><td>Price</td><td>Lower price limit, when set.</td></tr>
    <tr><td>1149</td><td>HighLimitPrice</td><td>N</td><td>Price</td><td>Upper price limit, when set.</td></tr>
    <tr><td>1150</td><td>TradingReferencePrice</td><td>N</td><td>Price</td><td>Reference price for percentage limits.</td></tr>
    <tr><td>15</td><td>Currency</td><td>C</td><td>Currency</td><td>Currency for the instrument. Present when 980 = A.</td></tr>
    <tr><td>\< Standard Trailer ></td><td /><td>Y</td><td /><td /></tr>
  </tbody>
</table>

**Example 23: SecurityDefinitionUpdateReport \[BP] for an added and a terminated instrument**

Instrument added (SecurityUpdateAction (980) = A):

```
8=FIXT.1.1 | 9=214 | 35=BP | 34=57 | 49=TARGET | 52=20240517-13:30:00.120511204 | 56=SENDER | 320=REF-DATA-002 | 322=1HPT7F2AA6411 | 980=A | 55=AAPL | 48=AAPL | 22=8 | 167=EVENT | 231=1 | 864=1 | 865=5 | 866=20240517 | 868=StartDate | 969=0.01 | 562=1 | 15=USD | 10=090 |
```

Instrument terminated (980 = D):

```
8=FIXT.1.1 | 9=118 | 35=BP | 34=58 | 49=TARGET | 52=20240517-20:00:00.004118730 | 56=SENDER | 320=REF-DATA-002 | 322=1HPT7F2AA6412 | 980=D | 48=MSFT | 22=8 | 10=212 |
```

### Figure 16: Request form security reference data

![](https://files.readme.io/e1f144a-security_list.png)


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.