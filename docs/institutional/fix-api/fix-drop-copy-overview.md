> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Drop Copy Overview

The Polymarket Exchange provides optional drop-copy sessions which deliver real-time copies of execution reports and order state changes to authorized participants.

## What is Drop Copy?

Drop-copy sessions are read-only FIX sessions that cannot be used to enter, modify, or cancel orders. Instead, they provide a separate feed of execution activity, allowing participants to monitor their trading activity through an independent connection.

The Drop Copy FIX feed provides execution reports to exchange participants and third-party service providers. The service can be configured to provide data for a specific participant, clearing member, or all participants. Drop copies provided via this service will include all execution reports regardless if the orders or quotes were sent via a FIX session or the REST API.

## Common Use Cases

Drop-copy sessions are commonly used for:

* **Regulatory compliance and audit trails** - Maintain a complete record of all order activity
* **Real-time risk management** - Monitor fills and positions without exposing order-entry capabilities
* **Back-office reconciliation** - Feed execution data to separate systems for settlement and accounting
* **Clearing firm oversight** - Allow clearing firms to monitor client execution activity

## Session Configuration

Drop-copy sessions use the same FIXT 1.1 / FIX 5.0 SP2 protocol as order-entry sessions, but with different credentials and typically connect to a different endpoint. Contact the exchange operator to provision drop-copy session access.

## Messages Received

Drop-copy sessions receive unsolicited ExecutionReport messages for all order activity, including:

* Order acknowledgements
* Order fills
* Order cancellations
* Order modifications
* Order rejections
* Order expirations

<Note>
  For detailed field specifications of the ExecutionReport message, see [ExecutionReport Message](/institutional/fix-api/fix-drop-copy-execution-report).
</Note>
