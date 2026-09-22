> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# FIX FAQs

## Getting FIX Access

**What do I need to provide to get FIX access?**

If you want FIX access, indicate it and include your AWS account ID on your application.

Polymarket will provide:

* SenderCompID and TargetCompID
* User identifiers (SenderSubID)
* Account identifiers (Account)
* Connection ports and DNS endpoints

**What is the CompID format?**

CompIDs follow the format:

* SenderCompID: `PMX_{FIRMNAME}`
* TargetCompID: `{FIRMNAME}_PMX`

These are PMX-assigned and case-sensitive. Clients must not generate or modify CompIDs.

***

## FIX Session Configuration

**What is the FIX protocol version used?**

FIXT.1.1 with DefaultApplVerID=9 (FIX50SP2)

**What are the session connection details?**

Connection details are provided during onboarding and vary by client. Typical parameters include:

* BeginString: FIXT.1.1
* SenderCompID: \[Your assigned CompID]
* TargetCompID: \[Polymarket assigned CompID]
* Host: \[Provided during onboarding]
* Port: \[Varies by service - Order Entry, Drop Copy, or Market Data]
* Heartbeat Interval: 30 seconds (configurable)
* Encryption: None (98=0)

**What ports are used for different FIX services?**

There are three services: Order Entry, Drop Copy, and Market Data. Ports are provided during onboarding and are fixed for all clients.

**What is the connection model?**

FIX sessions are client-initiated. PMX acts as the acceptor. Transport is FIXT.1.1 with application messages using FIX 5.0 SP2.

Example QuickFIX-style configuration:

```
[DEFAULT]
ConnectionType=initiator
BeginString=FIXT.1.1
DefaultApplVerID=9
SocketConnectHost=<PMX_HOST>
SocketConnectPort=<PMX_PORT>

[SESSION]
SenderCompID=<PMX_PROVIDED>
TargetCompID=<PMX_PROVIDED>
```

**Is the FIX connection SSL-enabled?**

No, encryption method is None (tag 98=0). FIX connectivity runs over plain TCP via AWS PrivateLink, with access controlled by network-level access (PrivateLink) and FIX session identifiers (SenderCompID / TargetCompID). No client certificates or private keys are required.

**What is the DNS hostname format for FIX connections?**

FIX connections use the format: `<client>-fix.<region>.privatelink.<environment>.polymarketexchange.com`

We do not expose fixed outbound IPs for FIX; the FIX gateways run behind AWS where IP addresses are not guaranteed to be static. Clients should connect using the provided FIX DNS entry, which resolves via DNS to the active endpoints.

**Is Private DNS required immediately?**

No. Private DNS may not be immediately enabled, but this is not a blocker. Clients can connect using the default VPC endpoint-specific DNS and switch to the friendly hostname once Private DNS is enabled.

**Does FIX Logon require username and password?**

No. FIX Logon (35=A) does not require username/password (tags 553/554). Session authentication is based on the agreed SenderCompID / TargetCompID and network access via AWS PrivateLink. Password-based Logon authentication can be supported in the future but is not required for current integrations.

***

**What are the identifier rules?**

All identifiers (SenderCompID, TargetCompID, SenderSubID, Account) are:

* PMX-assigned during onboarding
* Case-sensitive
* Printable alphanumeric characters only
* Must not be generated or modified by clients

**How are instruments identified?**

Instruments use Symbol (55) only. No SecurityID or other identification fields are required.

***

## Sequence Number Management

**When does the FIX session sequence number reset?**

Sequence numbers are session-scoped and only reset when a new FIX session is established using ResetSeqNumFlag (141=Y) on Logon. Sending Logon without 141=Y resumes the existing session and allows gap recovery. Any regular reset cadence (daily, weekly, etc.) is an operational convention and must be explicitly coordinated; it is not automatic or protocol-defined.

**Can the sequence number reset time be changed?**

Yes. Contact the Polymarket team to configure your preferred reset time (e.g., 00:00:00 UTC, 22:00:00 UTC, etc.).

**Are there limits on ResendRequest (35=2)?**

No limit on the number of messages returned in response to a ResendRequest.

**What happens if early messages are unavailable when a ResendRequest starts from sequence 1?**

This should not happen, but if it does, you would receive a SequenceReset (MsgType=4) to advance to the available sequence number.

**Why might the first sequence number in FIX logon be 2 instead of 1?**

This can occur after a logout/logon cycle due to session persistence from a previous connection or timing misalignment between session schedules. Your FIX client application may send a resend request in this case, but no impact is expected. FIX logon messages should start with sequence number 34=1 when using ResetSeqNumFlag (tag 141=Y).

**What happens when the FIX sequence number reaches its maximum value (2^31 - 1)?**

The FIX protocol defines MsgSeqNum (tag 34) as type SEQNUM (positive integer). When approaching practical limits, the session should be reset using one of these methods:

* Scheduled sequence number reset at the configured daily reset time
* Manual session restart with ResetSeqNumFlag (tag 141=Y) in the Logon message
* Administrative SequenceReset (MsgType=4) to restart numbering

In practice, sequence numbers rarely approach this limit due to daily resets. If you anticipate high message volumes that could approach this limit between resets, contact Polymarket to adjust your reset schedule.

***

## Trade Messages

**What message type is used for FIX drop-copy - TCR (35=AE) or ER (35=8)?**

Execution Reports (35=8) are currently used for drop-copy and include all order lifecycle events (new, fills, cancels, amendments, rejections).

Trade Capture Reports (TCR, 35=AE) are available in streaming mode for clients who only need fill notifications. When using TCR:

* Client establishes Drop Copy FIX session and sends Logon (35=A)
* On successful logon, the exchange automatically streams TradeCaptureReport (35=AE) for all new trades going forward
* TCRs only include fills, not cancels, replaces, or rejects
* No TradeCaptureReportRequest (35=AD) messages are required beyond normal FIX session management (heartbeats/resend)

Request-based TCRs (where you send TradeCaptureReportRequest to get historical snapshots) are not currently supported.

**For trades, do we only need to process 35=8 with 150=F?**

Yes, correct. To process trade executions, filter for:

* Message type 35=8 (ExecutionReport)
* AND ExecType 150=F (Trade)

Other ExecType values indicate different order lifecycle events (0=New, 4=Cancellation, 5=Amendment, 8=Rejection, C=Expiration). Only 150=F indicates an actual trade execution.

**Can TrdMatchID (tag 880) be used as a unique trade identifier?**

Yes, you can use TrdMatchID (tag 880) as a unique trade identifier. Key characteristics:

* Both buyer and seller receive the SAME TrdMatchID value - it identifies the trade itself, not each side
* The value is a 13-character alphanumeric string
* It matches the TradeID (1003) value in market data updates
* Each trade receives a unique TrdMatchID

**When can a value in TrdMatchID (tag 880) be reused?**

TrdMatchID values are unique per trade and should not be reused across different trades, days, or instruments.

**Is it possible to receive more than one Execution Report (35=8) for a trade?**

You will receive one ExecutionReport (35=8) with ExecType=F per fill event. However, a single order can receive multiple fills, which means you'll receive multiple ERs with 150=F for that order. Example:

* Order for 1000 contracts is submitted
* First fill: 400 contracts → ER with 150=F, LastQty=400, CumQty=400, OrdStatus=1 (Partially Filled)
* Second fill: 600 contracts → ER with 150=F, LastQty=600, CumQty=1000, OrdStatus=2 (Filled)

So you get multiple ERs with 150=F for one order (one per fill), but only one ER per individual fill/trade event.

**Is the quantity provided in LastPx (tag 31) absolute/total quantity or nominal?**

Note: Tag 31 is LastPx (last price), not quantity. Tag 32 (LastQty) contains the quantity.

Tag 32 (LastQty): This is the absolute/total quantity traded in this last fill, not a nominal quantity requiring a multiplier.

Related tags:

* Tag 31 (LastPx): Price of the last fill
* Tag 32 (LastQty): Quantity of the last fill
* Tag 119 (SettlCurrAmt): Total amount = LastPx × LastQty

There is no multiplier - the quantity is the actual traded amount.

**Do you support amendment/cancellation of already executed trades?**

We do not support amending or canceling already-executed trades via the FIX API. Our FIX protocol supports:

* Order amendments (OrderCancelReplaceRequest \[G]) - for open orders only
* Order cancellations (OrderCancelRequest \[F]) - for open orders only

Once a trade is executed (you receive an ER with 150=F), it is considered final and cannot be modified or canceled through FIX messages. If a trade correction is required due to an error, contact our operations team directly.

***

## Matching Engine Behavior

**When an order is partially filled through multiple executions within a single match, do you send one consolidated trade notification or multiple trade messages?**

Each individual fill generates a separate ExecutionReport (35=8) with ExecType=F (150=F).

Example: If a buy order for quantity 30 is matched against two sell orders of 10 and 20:

* You receive TWO separate ExecutionReports with 150=F
* First ER: LastQty=10, CumQty=10, OrdStatus=1 (Partially Filled)
* Second ER: LastQty=20, CumQty=30, OrdStatus=2 (Filled)
* Each fill will have a DIFFERENT TrdMatchID (tag 880) because they represent separate trades with different counterparties

**Can a buy/sell order be matched against multiple opposite-side orders at different prices?**

Yes, this is possible depending on the matching algorithm. Each match at a different price generates a separate trade with its own ExecutionReport.

Example: Buy order for qty=30 at limit price=0.99 matched against:

* Sell order: qty=10 at price=0.98 → First ER with LastQty=10, LastPx=0.98, unique TrdMatchID
* Sell order: qty=20 at price=0.99 → Second ER with LastQty=20, LastPx=0.99, different TrdMatchID

Each fill is reported as a separate trade with different TrdMatchIDs because they are distinct trade events at different prices.

***

## Party IDs & Roles

**What is the business meaning of Party IDs for PartyRoles 1, 3, and 24?**

* **PartyRole 1 (EXECUTING\_FIRM)**: The clearing member or broker executing the trade on behalf of the client
* **PartyRole 3 (CLIENT\_ID)**: The end client for whom the trade is being executed
* **PartyRole 24 (CUSTOMER\_ACCOUNT)**: The specific trading account within the customer's structure

**How are Party IDs determined? Are they configurable?**

Party IDs use PartyIDSource = D (Proprietary/Custom code), which means each organization establishes its own proprietary identifier scheme independently.

For Polymarket:

* **Who assigns them**: Polymarket assigns Party ID values during client onboarding
* **Format**: Proprietary format following Polymarket's internal naming conventions (e.g., "20251118-ion-test-api-clearing-member")
* **Configurable**: The values themselves are assigned by Polymarket, not client-configurable. However, they are specific to your account and determined during onboarding
* **Usage**:
  * **PartyRole 1 (EXECUTING\_FIRM)**: Identifies the clearing member or broker executing trades
  * **PartyRole 3 (CLIENT\_ID)**: Identifies the end client
  * **PartyRole 24 (CUSTOMER\_ACCOUNT)**: Identifies the specific trading account

These Party IDs are optional fields in FIX messages but help identify the various parties involved in a trade. Contact the Polymarket onboarding team to confirm your assigned Party ID values for each role.

***

## FIX Market Data

**Does MarketDataIncrementalRefresh (35=X) include TradingSessionID only for trades, or will we receive updates when trading status changes?**

Yes, you will receive updates when trading status changes. Trading status changes are communicated via MarketDataIncrementalRefresh (35=X) messages using the TradingSessionID tag (336). When an instrument's state changes, you'll receive a MarketDataIncrementalRefresh with TradingSessionID set to one of:

* CLOSED
* OPEN
* PREOPEN
* SUSPENDED
* EXPIRED
* TERMINATED
* HALTED
* MATCH\_AND\_CLOSE\_AUCTION

**Since SecurityListUpdate (35=d) is not supported, when a new instrument is added after receiving the initial SecurityList (35=y), how do we get that new instrument?**

Currently, SecurityListUpdate (35=d) is not supported. To discover new instruments, you must send another SecurityListRequest (35=x). SecurityListUpdate will soon be added to proactively notify clients when new instruments are added.

**Are new instruments added to your system only once per day? When?**

New instruments are added throughout the day as they become available.

***

## Historical Trades

**How can historical trades be downloaded?**

**Within a session**: If a client crashes or disconnects, FIX automatically redelivers missed messages via gap fill. Client reconnects and resumes processing using ResendRequest (35=2). This is the primary mechanism for intraday recovery.

**Beyond a session**: FIX replay is limited to messages retained for the active session. Once a session is reset with ResetSeqNumFlag (141=Y), prior messages cannot be replayed. FIX is not intended for bulk or multi-session historical backfill. Prior-day or long-range history requires a separate reporting/export mechanism.

**Important**: Trade persistence is independent of FIX sequencing. Trades are stored regardless of session state.

***

## Session Behavior

**What are the Cancel on Disconnect/Logout settings?**

Cancel on Disconnect = Yes, Cancel on Logout = Yes

**What are the session times?**

Default session time is 17:01:00 - 17:01:00 America/New\_York (configurable per client)

**Are CompIDs different between environments?**

No. CompIDs, SenderSubID, and Account values are the same in both preprod and prod environments. This simplifies configuration management across environments.

***

## Common Connection Issues

**Why might a connection be immediately reset after sending a FIX Logon?**

The most common cause is having SenderCompID and TargetCompID reversed. The server cannot find a matching session if the CompIDs don't match any configured session.

**Solution:** Verify your SenderCompID and TargetCompID match the values provided during onboarding. The CompID convention is that you send AS your assigned PMX-side CompID TO Polymarket's assigned CompID.

**What is the correct CompID configuration?**

Use the SenderCompID and TargetCompID values provided during your onboarding. Example format:

* SenderCompID = PMX\_\[CLIENT]*DC (for Drop Copy) or PMX*\[CLIENT]\_OE (for Order Entry)
* TargetCompID = \[CLIENT]\_PMX\_DC (for Drop Copy) or \[CLIENT]\_PMX\_OE (for Order Entry)

Contact the Polymarket onboarding team if you need clarification on your assigned CompIDs.

***

## Testing & Environment

**How can I test the FIX connection?**

Automated trading and liquidity is simulated in the testing environment. Contact Polymarket's onboarding team to coordinate additional test trades if needed for your session testing purposes.

**Can you provide bulk test data for high-volume recovery testing?**

Contact the Polymarket onboarding team to request bulk test trade data for testing FIX message recovery scenarios and capacity planning.

***

## FIX Data Format

**What delimiter is used?**

FIX uses SOH (Start of Header, `\x01`) as the field delimiter.

**Do prices and quantities support decimals?**

Yes. Prices and quantities support decimal values.

**What timestamp format is used?**

UTC timestamps, which may include sub-second precision.
