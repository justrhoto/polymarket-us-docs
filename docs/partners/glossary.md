> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Partner Glossary

> Terminology used throughout the Partner Integration docs, including the entities you act on and the people you onboard.

This glossary defines the terms used across the Partner Integration docs. For market-structure and trading terms (instruments, order book, fills, settlement), see the [main Glossary](/getting-started/glossary).

## People and organizations

| Term                   | Definition                                                                                                                                                                                                                                                                |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Partner**            | An Introducing Broker (IB) or Independent Software Vendor (ISV) integrating with Polymarket US to provide a trading experience to retail traders.                                                                                                                         |
| **Retail Participant** | **The canonical term in these docs for an end user you onboard** — a retail trader who trades through your platform. You act on their behalf.                                                                                                                             |
| **Customer**           | Used in the **FCM context** (a Futures Commission Merchant's customer). It is acceptable to use "customer" informally for a Retail Participant, but because it has a specific meaning for FCMs, prefer **Retail Participant** in partner integrations to avoid ambiguity. |

<Note>
  **"Participant" appears in two unrelated senses across Polymarket docs.** In these partner docs it always means a *trading identity* (a person you onboard — a Retail Participant). The [main glossary](/getting-started/glossary) separately uses "participant" in a market-structure sense (an outcome side of an instrument). The two meanings are unrelated; this section always means the trading identity.
</Note>

## Platform and entities

| Term                                        | Definition                                                                                                                                                       |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **DCM (Designated Contract Market)**        | The regulated matching function: maintains the order book, matches orders, and publishes market data.                                                            |
| **DCO (Derivatives Clearing Organization)** | The regulated clearing function: holds collateral, clears trades, and settles contracts.                                                                         |
| **Polymarket US**                           | The platform as a whole. Throughout these docs it is represented as a single actor, regardless of whether a call is served by the matching or clearing function. |
| **Firm**                                    | Your IB/ISV organization — the top-level permissions container you authenticate as. You act on behalf of the Retail Participants beneath your Firm.              |
| **Participant**                             | A Retail Participant's trading identity at the DCM, used to scope order entry and account queries. Referenced by an ID such as `firms/your-firm/users/their-id`. |
| **Clearing Member**                         | A funds- and position-holding identity at the DCO. Each Retail Participant has a Clearing Member account.                                                        |
| **Account**                                 | The trading account holding a Retail Participant's balances and positions. Provisioned automatically alongside the Retail Participant on KYC approval.           |

## Onboarding and identity

| Term                         | Definition                                                                                                                                                                                                                                                     |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **KYC (Know Your Customer)** | Identity verification. You **collect** the required information from a Retail Participant and submit it; Polymarket US (the DCM) **performs the verification and makes the decision**. On approval, the Participant and Account are provisioned automatically. |
| **Auto-provisioning**        | The automatic creation of a Retail Participant's trading identity and Account when their KYC is approved — there is no separate "create user/account" call.                                                                                                    |
| **Access token**             | The short-lived bearer token you obtain via [Private Key JWT](/partners/get-connected/authentication) and send on each API request.                                                                                                                            |
| **`x-participant-id`**       | The request header identifying which Retail Participant an account-scoped action is for.                                                                                                                                                                       |

## Funding

| Term                        | Definition                                                                                                                                                                                                                                                                         |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Partner Funding**         | The partner funding model: the funding entity pre-positions pooled funds at Polymarket US and funds participant trading accounts with instant deposit transfers; vendor fees are declared per order and collected periodically. See [Partner Funding](/partners/funding/overview). |
| **Partner funding account** | The pooled account at Polymarket US, held by your funding entity — the unallocated pool that deposits draw from and that withdrawals and vendor fee collections return to.                                                                                                         |
| **Funding entity**          | The separate legal entity in your corporate structure that custodies participant cash off-platform and holds the partner funding account. Your firm itself never holds funds.                                                                                                      |
| **Transfer**                | A cash movement between the partner funding account and a participant account, for one of three reasons: `DEPOSIT`, `WITHDRAWAL`, or `VENDOR_FEES`. The funding account is always one side. See [Transfers](/partners/funding/transfers).                                          |
| **Deposit**                 | A transfer from the partner funding account into a participant's account, mirroring the participant's wallet allocation — this is what creates buying power.                                                                                                                       |
| **Withdrawal**              | A transfer from a participant's account back to the partner funding account, mirroring a wallet de-allocation. Limited to the participant's free cash.                                                                                                                             |
| **Buying power**            | The cash in a participant's trading account. Polymarket US rejects an order unless it covers the order's worst-case collateral plus exchange fee.                                                                                                                                  |
| **Collateral**              | The funds required to back an order or position: `quantity × price` for buys, `quantity × (1 − price)` for sells. Locked within the participant's account while at risk.                                                                                                           |
| **Vendor fee**              | A fixed USD amount you declare per order, per your agreement with the participant. Recorded against the order — never moved at order time — and collected periodically. See [Vendor Fees](/partners/funding/vendor-fees).                                                          |
| **Vendor fee accrual**      | The running total of declared, uncollected vendor fees per participant — a receivable your platform must track off-platform and subtract from spendable balance.                                                                                                                   |
| **Vendor Fees report**      | The daily report of fees your firm declared, per order and netted per account, used by your funding entity to reconcile and drive collection.                                                                                                                                      |

## Related references

<CardGroup cols={2}>
  <Card title="Main Glossary" icon="book" href="/getting-started/glossary">
    Market structure, trading, and execution terms.
  </Card>

  <Card title="Platform Model" icon="sitemap" href="/partners/platform-model">
    How these entities relate in practice.
  </Card>
</CardGroup>
