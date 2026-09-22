> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# FIX API Overview

The purpose of this document is to outline the trading functionality available via a FIX trading protocol.

<Card title="Download FIX Dictionaries" icon="download" href="https://drive.google.com/uc?export=download&id=1zoMi4ucCbj6FoS-x7vE4ysZ-R02b49uB">
  Download FIX 5.0 SP2 and FIXT 1.1 XML specifications (ZIP)
</Card>

## Rate Limits

The FIX API enforces a rate limit of **150 messages per second per session**. This limit applies to all inbound messages from the client to the exchange, across all participants.

## Firm, User and Account Identifiers

The Polymarket US exposes two FIX gateways to participants; an order management gateway, and a second gateway to receive market data. Additional drop-copy sessions can be provided upon request.

Note that should the Exchange offer direct market access (DMA) to their underlying customer, then each DMA customer should have their own dedicated pair of FIX gateways.

An example FIX session configuration is shown below.  Note the network details and Sender/TargetCompID (in red) will be provided by the exchange operator.

### Example QuickFIX session configuration

`[DEFAULT]  
ConnectionType=initiator  
SocketConnectHost=12.12.12.12
SocketConnectPort=13001
BeginString=FIXT.1.1
DefaultApplVerID=9
SenderCompID=SENDERCOMP1 [SESSION]
TargetCompID=EXCHANGECOMPID`

The Polymarket US also validates individual users (traders) using SenderSubID (50), and customer accounts using Account (1) which are validated on order entry. Please contact the exchange operator to allocate these codes.

## Symbology

Polymarket US uses a simple string identifier to instruments trading on the platform, which is required to identify instruments in the API using Symbol (55). There is currently no support to identify instruments using any other common identifiers such as CUSIP, ISIN or Bloomberg code.

A list of instruments on the platform can be retrieved using the SecurityListRequest \[x] message.

## Instrument States

Instruments follow the primary lifecycle: PENDING → OPEN → CLOSED → EXPIRED → TERMINATED. Instruments may also be SUSPENDED or HALTED during their lifecycle.

<br />

### Primary State Flow

| State                                               | Description                                                                                                                                                                                                      |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PENDING`                                           | Initial state for a newly created instrument which has not yet begun trading. Clients will receive a PENDING → OPEN state change notification but will not see PENDING in the order book.                        |
| `OPEN`                                              | In this state, the instrument is open for continuous order entry and matching.                                                                                                                                   |
| `CLOSED`                                            | In this state, orders can not be entered, modified, or canceled, and no matching occurs. Any existing Day orders will be expired.                                                                                |
| `EXPIRED`                                           | An instrument moves to this state when its Expiration Date/Time is reached. In this state, any resting orders are expired and no new orders can be entered.                                                      |
| `TERMINATED`                                        | When an instrument's Termination Date is reached, the order book is removed from the matching engine, orders are canceled, and positions are closed. Historical data will still remain in Polymarket US ledgers. |

### Exception States

| State                                               | Description                                                                                   |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `SUSPENDED`                                         | Orders can be canceled but no matching occurs, and no order entry or modification is allowed. |
| `HALTED`                                            | This state is similar to SUSPENDED, with the exception that orders cannot be canceled.        |

### Other Possible States

| State                                               | Description                                                                                                                                                                                                                                                                                       |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PREOPEN`                                           | Orders can be entered and modified, but no matching occurs. When the instrument transitions to an OPEN state, the orders entered during PREOPEN will match at a single opening price that is automatically determined by an algorithm that is designed to maximize the volume traded at the open. |
| `MATCH_AND_CLOSE_AUCTION`                           | This state is similar to PREOPEN, with the exception that matching will occur upon the transition of this state to any other state. This state is useful if you want matching to occur at the end of the state, but you don't want the instrument to be open after.                               |

## FIX Notation

Please note the following presentation notes which apply to message definitions and FIX examples throughout this document.

* FIX tag/value pairs are delimited within a TCP connection using the SOH (ascii character 1) character. Since this is a non-printable character, in this document we use the | character instead, and pad each pair with spaces to make them easier to use.
* Components are blocks of FIX tags which appear frequently in the specification (e.g. header and footers which appear on every FIX message). They are defined centrally for convenience and then referenced throughout the document using \<> notation.
* Repeating groups of FIX tags appear in various messages. The depth of a repeating group is indicated using the → marker in FIX message definitions.
* References to individual FIX fields (or “tags”) are presented in italic font, with the tag number following the tag name. For example HeartBtInt (108).
