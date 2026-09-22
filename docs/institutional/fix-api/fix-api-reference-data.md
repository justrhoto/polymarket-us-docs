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
    <tr><td>336</td><td>TradingSessionID</td><td>N</td><td>String</td><td>Used to filter for instruments by market state (CLOSED, OPEN, PREOPEN, SUSPENDED, EXPIRED, TERMINATED, HALTED, MATCH\_AND\_CLOSE\_AUCTION)</td></tr>
    <tr><td>559</td><td>SecurityListRequestType</td><td>Y</td><td>int</td><td>The type of request being made (0=Individual symbol, 4=All Securities)</td></tr>
    <tr><td>55</td><td>Symbol</td><td>C</td><td>String</td><td>Required if SecurityListRequestType (559) = 0 (individual security)</td></tr>
    <tr><td>\< Standard Trailer ></td><td /><td>Y</td><td /><td /></tr>
  </tbody>
</table>

**Example 21: Request for information on all securities**

```
8=FIXT.1.1 | 9=75 | 35=x | 49=SENDER | 56=TARGET | 34=12 | 52=20240516-14:28:38 | 320=REF-DATA-001 | 559=4 | 10=048 |
```

Upon receipt, Polymarket US will respond with a SecurityList \[y] message containing the requested information. Note that the content provided by the SecurityList \[y] message does not differ depending on whether an individual symbol was listed versus all securities.

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
    <tr><td>560</td><td>SecurityRequestResult</td><td>Y</td><td>int</td><td>The status of the request (0=Valid, 1=Invalid/unsupported, 3=Not authorized)</td></tr>
    <tr><td>146</td><td>NoRelatedSym</td><td>C</td><td>NumInGroup</td><td>Number of instruments to be returned. Only present for valid requests.</td></tr>
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

**Example 22: SecurityList \[y] indicating two securities (color-coded)**

```
8=FIXT.1.1 | 9=336 | 35=y | 34=9 | 49=TARGET | 52=20240516-14:28:38.864954771 | 56=SENDER | 146=2 | 55=GC-Dec-2030 | 48=GC-Dec-2030 | 22=8 | 167=NONE | 231=1 | 864=1 | 865=5 | 866=19700101 | 868=StartDate | 969=0.01 | 1151=GC | 562=1 | 15=USD | 55=GOOG | 48=GOOG | 22=8 | 167=NONE | 231=1 | 864=1 | 865=5 | 866=19700101 | 868=StartDate | 969=0.01 | 1151=Equities | 562=1 | 15=USD | 320=2007026312 | 322=1HPT7F2AA6404 | 560=0 | 10=007 |
```

### Figure 16: Request form security reference data

![](https://files.readme.io/e1f144a-security_list.png)
