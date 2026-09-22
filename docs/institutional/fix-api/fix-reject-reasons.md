> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# FIX Reject Reasons

> Error codes and reject messages across FIX sessions

## Application Layer Messages

### Execution Reports (35=8) and Order Cancel Reject (35=9)

For Execution Reports (i.e. when a NewOrderSingle is rejected), the reason code is provided in **OrdRejReason (Tag 103)**. For Order Cancel Reject messages (i.e. when a cancel or cancel/replace is rejected), the reason code is provided in **CxlRejReason (Tag 102)**.

Note that the FIX protocol specifies different enumerations for OrdRejReason vs CxlRejReason. As such, the exact same error condition may produce a different error code in an execution report versus an order cancel reject message.

| Description                                                                     | Example Error String (Tag 58)                                                                                                                                                                   | OrdRejReason (Tag 103) | CxlRejReason (Tag 102) |
| ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ---------------------- |
| Notional lower than minimum                                                     | "Low total notional size limit is 1, given 0.944"                                                                                                                                               | Exchange option (0)    | Exchange option (2)    |
| Notional larger than maximum                                                    | "High total notional size limit is 500000, given 500025"                                                                                                                                        | Exchange option (0)    | Exchange option (2)    |
| Price lower than minimum                                                        | "Low price limit is 0.5, given 0.49"                                                                                                                                                            | Exchange option (0)    | Exchange option (2)    |
| Price higher than maximum                                                       | "High price limit is 1.5, given 1.51"                                                                                                                                                           | Exchange option (0)    | Exchange option (2)    |
| Quantity lower than minimum                                                     | "Low order size limit is 100, given 98"                                                                                                                                                         | Exchange option (0)    | Exchange option (2)    |
| Quantity higher than maximum                                                    | "High order size limit is 500, given 600"                                                                                                                                                       | Exchange option (0)    | Exchange option (2)    |
| Minimum trade quantity                                                          | "Minimum trade quantity is 100, given 99"                                                                                                                                                       | Exchange option (0)    | Exchange option (2)    |
| Insufficient buying power                                                       | "1000 USD available, requested 1000.098"                                                                                                                                                        | Exchange option (0)    | Exchange option (2)    |
| Self Match Prevention                                                           | "Self Match Prevention"                                                                                                                                                                         | Exchange option (0)    | Exchange option (2)    |
| Participate Don't Initiate                                                      | "Order may participate but not initiate in the market"                                                                                                                                          | Exchange option (0)    | Exchange option (2)    |
| BEST\_LIMIT Exec Instruction with no orders on same side                        | "No liquidity to derive limit price"                                                                                                                                                            | Exchange option (0)    | Exchange option (2)    |
| IMMEDIATELY\_EXECUTABLE\_LIMIT Exec Instruction with no orders on opposite side | "No liquidity to derive limit price"                                                                                                                                                            | Exchange option (0)    | Exchange option (2)    |
| Re-use of ClOrdID in Session                                                    | "ClOrdID already in use by an open order"                                                                                                                                                       | Exchange option (0)    | Exchange option (2)    |
| Account Type Validation                                                         | "Requested Account Type (FLOOR\_TRADER) does not match account configuration"                                                                                                                   | Exchange option (0)    | Exchange option (2)    |
| Customer Order Capacity validation                                              | "Requested Customer Order Capacity (PROPRIETARY\_ACCOUNT) does not match user/account configuration"                                                                                            | Exchange option (0)    | Exchange option (2)    |
| No Reference Price for Market to Limit Order                                    | "failed risk check: rpc error: code = FailedPrecondition desc = No last trade when open, trading reference price, settlement price, or previous close is available to evaluate reference price" | Exchange option (0)    | n/a                    |
| No Qty Filled on CashOrderQty Order                                             | "There is no liquidity to immediately fill any portion of this CashOrderQty order, and the order cannot rest as a limit order because the order qty would be 0 at the current fallback price"   | Exchange option (0)    | n/a                    |
| Invalid Attributes                                                              | "Order has attributes that cannot be placed in MATCH\_AND\_CLOSE\_AUCTION"                                                                                                                      | Exchange closed (2)    | Exchange option (2)    |
| Invalid Attributes                                                              | "Order has attributes that cannot be placed in PRE\_OPEN"                                                                                                                                       | Exchange closed (2)    | Exchange option (2)    |
| Market Closed                                                                   | "Book is CLOSED"                                                                                                                                                                                | Exchange closed (2)    | Exchange option (2)    |
| Market Suspended by Exchange                                                    | "Book is SUSPENDED"                                                                                                                                                                             | Exchange closed (2)    | Exchange option (2)    |
| Market Halted by Exchange                                                       | "Book is HALTED"                                                                                                                                                                                | Exchange closed (2)    | Exchange option (2)    |
| Attempt to Cancel/Replace a Filled Order                                        | "Unknown order"                                                                                                                                                                                 | n/a                    | Unknown order (1)      |

<Note>
  **`Global Rate Limit Exceeded` is a latency stopgap, not a rate limit.** During periods of increased latency, an order that has been received but not processed within 5 seconds is rejected with the text `Global Rate Limit Exceeded` to protect you from a bad fill at a stale price. This is **not** an actual rate limit — do **not** throttle your traffic in response. It applies to new orders and cancel/replace modifications, but **not** to pure cancels. You can always cancel an order before it has been acknowledged or processed. See [Rate Limits](/trader-guide/rate-limits#latency-stopgap-on-orders).
</Note>

### Market Data Request Reject (35=Y)

There are no cases where the FIX Market Data Gateway will send this message. Rejections on the FIX MD Gateway will be either 35=3 or 35=j messages.

## Session Layer Messages

### New Message Reject (35=3)

A session level reject is sent when the FIX session cannot process an incoming message. RefSeqNum(45) will contain the MsgSeqNum(34) of the message that triggered the reject.

SessionRejectReason(373) and Text(58) will contain an error code and description, respectively.

| Error Code (Tag 373) | Example Error String (Tag 58)                    |
| -------------------- | ------------------------------------------------ |
| 0                    | "Invalid tag number"                             |
| 1                    | "Required tag missing"                           |
| 1                    | "Account type must be provided"                  |
| 1                    | "Customer order capacity must be provided"       |
| 2                    | "Tag not defined for this message type"          |
| 4                    | "Tag specified without a value"                  |
| 5                    | "Value is incorrect (out of range) for this tag" |
| 6                    | "Incorrect data format for value"                |
| 7                    | "Decryption problem"                             |
| 8                    | "Signature problem"                              |
| 9                    | "CompID problem"                                 |
| 10                   | "SendingTime accuracy problem"                   |
| 11                   | "Invalid MsgType"                                |
| 13                   | "Tag appears more than once"                     |
| 14                   | "Tag specified out of required order"            |
| 15                   | "Repeating group fields out of order"            |
| 16                   | "Incorrect NumInGroup count for repeating group" |
| 99                   | "Other"                                          |

### Business Message Reject (35=j)

Below is a list of Business Message Reject (35=j) error strings produced by the exchange FIX gateways.

| Reason                                                        | Example Error String (Tag 58)                                | BusinessRejectReason (Tag 380)           |
| ------------------------------------------------------------- | ------------------------------------------------------------ | ---------------------------------------- |
| Self-Match Override Prohibited                                | "Session-level self match prevention ID already provided"    | Other (0)                                |
| Rate Limits on Session                                        | "Message rate limit throttled for session"                   | Other (0)                                |
| Unknown Account Type                                          | "Account type unknown"                                       | Other (0)                                |
| Unknown Customer Order Capacity                               | "Customer order capacity unknown"                            | Other (0)                                |
| Unsupported Commission Type                                   | "Unsupported CommType"                                       | Other (0)                                |
| MD session not eligible to have commission spread overwritten | "Cannot supply MDFeedType on this session"                   | Other (0)                                |
| Unknown account property in MDFeedType                        | "Unknown MDFeedType"                                         | Other (0)                                |
| Unknown Firm                                                  | "Legal Entity Unavailable: %s"                               | Unknown ID (1)                           |
| Unknown Security                                              | "Instrument Unavailable: %s"                                 | Unknown security (2)                     |
| Non Tradable Instrument                                       | "Instrument is not tradable"                                 | Unknown security (2)                     |
| Unsupported Message                                           | "Unsupported Message Type"                                   | Unsupported message type (3)             |
| Quotes Disabled                                               | "quotes are not available"                                   | Application not available (4)            |
| Cash Order Quantity Validation                                | "For cash\_order\_qty order\_type must be MARKET\_TO\_LIMIT" | Conditionally required field missing (5) |
| Conditionally Required Field Missing                          | "Conditionally Required Field Missing (%d)"                  | Conditionally required field missing (5) |
| Unsupported Message Type for Session                          | "message is not supported for this session type"             | Not authorized (6)                       |

***

## Common Connection and Order Issues

### 1. Logon Rejected Immediately

**Cause**: SenderSubID (50) sent on Logon message

**Fix**: Do not send tag 50 on Logon (35=A). Only include SenderSubID on application messages (order entry, cancel, etc.), not on session management messages.

### 2. No Connection / TCP Reset

**Cause**: Source IP not allowlisted, or connecting to wrong environment (preprod vs prod)

**Fix**: Confirm your static egress IP is whitelisted and verify you're connecting to the correct environment with Polymarket.

### 3. Order Rejected: Unknown Account

**Cause**: Missing or invalid Account (1)

**Fix**: Use account IDs explicitly provided by Polymarket during onboarding. Verify the Account tag value matches your assigned account.

### 4. Order Rejected: Not Authorized

**Cause**: Trader (SenderSubID) not permissioned for the specified account

**Fix**: Confirm trader-to-account mapping with Polymarket. Ensure the SenderSubID has permissions for the Account you're trading on.

### 5. Order Rejected: Invalid Price Increment

**Cause**: Price violates tick size for the instrument

**Fix**: Fetch MinPriceIncrement (969) from SecurityList (35=y) and ensure your order price respects the tick size increment.

### 6. Order Rejected: Incorrect Quantity

**Cause**: Quantity violates lot size or minimum/maximum quantity rules

**Fix**: Fetch MinTradeVol (562) from SecurityList (35=y). Ensure quantity respects the lot size increment and falls within min/max limits.

### 7. Post-Only Order Rejected

**Cause**: ExecInst=6 (post-only) would immediately match against existing orders

**Fix**: Adjust your limit price so it does not cross the current market, or remove the post-only instruction.

### 8. Order Accepted Then Immediately Canceled

**Cause**: Self-match prevention triggered

**Fix**: Check your SelfMatchPreventionID (7928) and verify the self-match instruction (8000=O or N). Orders from the same SMP ID that would match are canceled.

### 9. Market Data Not Received

**Cause**: Attempted to subscribe on order-entry session, or no MarketDataRequest (35=V) sent

**Fix**: Use the dedicated market data FIX session and send a valid MarketDataRequest subscription message.

### 10. Sequence Number / Resend Loop

**Cause**: MsgSeqNum mismatch after restart, creating continuous resend requests

**Fix**: Restart your session with ResetSeqNumFlag (141=Y) on Logon to reset sequence numbers to 1, or manually resync sequence numbers with your FIX engine.
