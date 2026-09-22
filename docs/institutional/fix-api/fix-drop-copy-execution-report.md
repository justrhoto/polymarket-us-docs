> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# ExecutionReport Message

The Drop Copy feed supports the delivery of Execution Reports for order updates, fills, and cancels. The ExecutionReport message structure is identical to that sent over order-entry sessions.

## ExecutionReport \[8] Message

### Core Fields

| Tag | Field        | Req | Type  | Description                                       |
| --- | ------------ | --- | ----- | ------------------------------------------------- |
| 35  | MsgType      | Y   | str   | 8 = ExecutionReport                               |
| 1   | Account      | N   | str   | Account reference if indicated on order           |
| 6   | AvgPx        | Y   | price | Volume-weighted average price of all trades       |
| 11  | ClOrdID      | Y   | str   | Participant-assigned order ID                     |
| 14  | CumQty       | Y   | qty   | Cumulative filled quantity                        |
| 17  | ExecID       | Y   | str   | Unique execution report ID (13-char alphanumeric) |
| 31  | LastPx       | Y   | price | Price of this fill (zero if not a trade)          |
| 32  | LastQty      | Y   | qty   | Quantity of this fill (zero if not a trade)       |
| 37  | OrderID      | Y   | str   | Exchange-assigned order ID (13-char alphanumeric) |
| 38  | OrderQty     | Y   | qty   | Total order quantity                              |
| 44  | Price        | Y   | price | Order limit price                                 |
| 54  | Side         | Y   | char  | 1=Buy, 2=Sell                                     |
| 55  | Symbol       | Y   | str   | Instrument symbol                                 |
| 60  | TransactTime | Y   | time  | Transaction timestamp                             |
| 99  | StopPx       | Y   | price | Stop price (zero for non-stop orders)             |
| 151 | LeavesQty    | Y   | qty   | Remaining unexecuted quantity                     |

### Order Status

| Tag | Field     | Req | Type | Values                                                                                                                                     |
| --- | --------- | --- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| 39  | OrdStatus | Y   | char | 0=New, 1=Partially filled, 2=Filled, 3=Done For Day, 4=Canceled, 6=Pending Cancel, 8=Rejected, A=Pending New, C=Expired, E=Pending Replace |
| 150 | ExecType  | Y   | char | 0=New, 3=Done For Day, 4=Canceled, 5=Replaced, 8=Rejected, C=Expired, F=Trade                                                              |

### Order Type & Time in Force

| Tag | Field       | Req | Type | Values                                                         |
| --- | ----------- | --- | ---- | -------------------------------------------------------------- |
| 40  | OrdType     | Y   | char | 2=Limit, 3=Stop, 4=Stop Limit, K=Market with leftover as limit |
| 59  | TimeInForce | Y   | char | 0=Day, 1=GTC, 3=IOC, 4=FOK, 6=GTD                              |
| 126 | ExpireTime  | N   | time | Order expiry timestamp                                         |

### Security Identification

| Tag | Field            | Req | Type | Description                                                                                         |
| --- | ---------------- | --- | ---- | --------------------------------------------------------------------------------------------------- |
| 22  | SecurityIDSource | Y   | str  | Security ID source (8=Exchange symbol)                                                              |
| 48  | SecurityID       | Y   | str  | Security identifier (matches Symbol)                                                                |
| 167 | SecurityType     | N   | str  | EVENT=Event contract. Currently, Polymarket only offers EVENT instruments.                          |
| 762 | SecuritySubType  | N   | str  | Sub-type qualification of SecurityType/CFICode                                                      |
| 460 | Product          | N   | int  | Product type: 1=AGENCY, 2=COMMODITY, 3=CORPORATE, 4=CURRENCY, 5=EQUITY, 6=GOVERNMENT, 7=INDEX, etc. |

### Trade-Specific Fields

| Tag  | Field              | Req | Type | Description                                                     |
| ---- | ------------------ | --- | ---- | --------------------------------------------------------------- |
| 12   | Commission         | N   | amt  | Commission amount charged on this fill, trades only             |
| 13   | CommType           | N   | char | Commission calculation method. 3=Absolute (total dollar amount) |
| 119  | SettlCurrAmt       | N   | amt  | Amount of this fill (LastPx × LastQty), trades only             |
| 381  | GrossTradeAmt      | N   | amt  | Total traded amount (AvgPx × CumQty)                            |
| 828  | TrdType            | N   | int  | Trade type: 0=Regular trade                                     |
| 880  | TrdMatchID         | C   | str  | Unique trade ID (13-char, same for buyer/seller)                |
| 1057 | AggressorIndicator | C   | bool | Whether this order was the aggressor                            |

### Order Modification

| Tag | Field                 | Req | Type | Description                                                         |
| --- | --------------------- | --- | ---- | ------------------------------------------------------------------- |
| 41  | OrigClOrdID           | N   | str  | Original ClOrdID being amended/canceled                             |
| 378 | ExecRestatementReason | N   | int  | Unsolicited cancel reason: 8=Market/exchange option, 99=Other (SMP) |

### Rejection

| Tag | Field        | Req | Type | Description                                                                                                                                                                                                         |
| --- | ------------ | --- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 103 | OrdRejReason | N   | int  | 0=Broker/Exchange, 1=Unknown symbol, 2=Closed, 3=Price limit, 5=Unknown order, 6=Duplicate ClOrdID, 11=Unsupported, 12=Surveillance, 13=Bad quantity, 15=Unknown account, 16=Price band, 18=Bad tick size, 99=Other |

### Account Classification

| Tag | Field             | Req | Type | Values                                                                                                                                    |
| --- | ----------------- | --- | ---- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| 581 | AccountType       | N   | int  | 1=CUSTOMER, 2=NON\_CUSTOMER, 3=HOUSE\_TRADER, 4=FLOOR\_TRADER, 14=LIQUIDITY\_PROVIDER, 17=FUTURES\_MARKET\_MAKER (see spec for full list) |
| 582 | CustOrderCapacity | N   | int  | 1=OWN\_ACCOUNT, 2=PROPRIETARY, 3=FINANCIAL\_ADVISOR, 4=ALL\_OTHER, 5=RETAIL\_CUSTOMER                                                     |

### Party Identification

| Tag   | Field         | Req | Type | Description                                           |
| ----- | ------------- | --- | ---- | ----------------------------------------------------- |
| 453   | NoPartyIDs    | N   | int  | Number of party entries                               |
| → 448 | PartyID       | N   | str  | Party identifier/code                                 |
| → 447 | PartyIDSource | N   | char | D=Proprietary                                         |
| → 452 | PartyRole     | N   | int  | 1=EXECUTING\_FIRM, 3=CLIENT\_ID, 24=CUSTOMER\_ACCOUNT |

### Advanced Features

| Tag  | Field                  | Req | Type | Description                                    |
| ---- | ---------------------- | --- | ---- | ---------------------------------------------- |
| 110  | MinQty                 | N   | qty  | Minimum execution quantity                     |
| 1028 | ManualOrderIndicator   | N   | bool | Order received manually vs electronically      |
| 6127 | ConditionTriggerMethod | N   | int  | Stop trigger: 2=Last price, 5=Settlement price |

### Self-Match Prevention

| Tag  | Field                          | Req | Type | Description                                                                                     |
| ---- | ------------------------------ | --- | ---- | ----------------------------------------------------------------------------------------------- |
| 7928 | SelfMatchPreventionID          | N   | str  | Unique identifier for the self-match prevention instruction                                     |
| 8000 | SelfMatchPreventionInstruction | N   | str  | Self-match instruction. O = Cancel oldest (resting) order, N = Cancel newest (aggressive) order |

***

## Example ExecutionReport for a Fill

```
| Field              | Value      | Description                    |
|--------------------|------------|--------------------------------|
| ClOrdID            | "ABCD"     | Client order ID                |
| OrdStatus          | "2"        | Order fully filled             |
| ExecType           | "F"        | Trade execution                |
| Side               | "1"        | Buy order                      |
| Account            | "account1" | Trading account                |
| Price              | 0.525      | Order limit price              |
| OrderQty           | 100        | Original order quantity        |
| LastQty            | 100        | Quantity of this fill          |
| LastPx             | 0.525      | Price of this fill             |
| AvgPx              | 0.525      | Average fill price             |
| LeavesQty          | 0          | Remaining unfilled quantity    |
| CumQty             | 100        | Total filled quantity          |
| GrossTradeAmt      | 52.50      | Total trade amount             |
| AggressorIndicator | false      | Passive side of trade          |
| TrdMatchID         | "trade123" | Unique trade identifier        |
```
