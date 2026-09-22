> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Accounts

> Trading account management for partners

The Accounts API provides trading account information for partners. Accounts are the containers for positions, balances, and order history.

<Info>
  **Accounts are created by KYC, not by a separate call.** A trading account is provisioned automatically when a Retail Participant's KYC verification is approved — there is no manual account-creation endpoint. See [Onboard Participants](/partners/onboarding/onboard-participants) for how KYC creates the Participant and Account together.
</Info>

## Endpoints

| Method | Endpoint       | Description           | API reference                                                 |
| ------ | -------------- | --------------------- | ------------------------------------------------------------- |
| `GET`  | `/v1/accounts` | List trading accounts | [List accounts ↗](/institutional/accounts/overview#endpoints) |

<Note>
  For participant **identity**, see [Participants](/partners/onboarding/users). The underlying identity endpoints are documented in the API reference: [Get who am I ↗](/institutional/accounts/overview#endpoints) (`GET /v1/whoami`) and [List users ↗](/institutional/accounts/overview#endpoints) (`GET /v1/users`).
</Note>

## Account Hierarchy

```
Partner (Firm)
└── Retail Participants (created via KYC)
    └── Accounts (auto-provisioned)
        └── Positions & Orders
```

* **Firm**: Your partner organization
* **Retail Participants**: Individual retail traders (created when KYC is approved)
* **Accounts**: Trading accounts (automatically provisioned with the participant)

## List Accounts

Returns the trading accounts available to the authenticated user.

### Request

```bash theme={null}
GET /v1/accounts
```

Optional query parameter:

* `user` - Filter by user ID

### Response

```json theme={null}
{
  "accounts": [
    "firms/ISV-Participant-Acme/accounts/user-123-trading",
    "firms/ISV-Participant-Acme/accounts/user-456-trading"
  ],
  "displayNames": [
    "John's Trading Account",
    "Jane's Trading Account"
  ]
}
```

### Response Fields

| Field          | Type  | Description                                   |
| -------------- | ----- | --------------------------------------------- |
| `accounts`     | array | Account identifiers                           |
| `displayNames` | array | Human-readable account names (parallel array) |

## Participant vs Account

| Entity          | Description                                                                           |
| --------------- | ------------------------------------------------------------------------------------- |
| **Participant** | A person with a verified identity (KYC). Created automatically on KYC approval.       |
| **Account**     | A trading account with balances and positions. Auto-provisioned with the participant. |

A Retail Participant can have multiple accounts for different purposes (e.g., separate trading strategies).

## Related guides

* [Onboard Participants](/partners/onboarding/onboard-participants) — How KYC creates the Participant and Account
* [Participants](/partners/onboarding/users) — Resolve who you can act for
* [KYC Verification](/partners/onboarding/kyc/overview) — The participant onboarding process
* [Positions API](/institutional/positions/overview) — Check account balances and positions
