> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Accounts API Overview

> Query the authenticated identity, tradable accounts, and users you may act on behalf of

# Accounts API

The Accounts API is the public identity and account **query** surface. Market makers and ISV/IB partners use it to learn who they are trading as and which accounts they can use.

<Info>
  Account **creation** is not a public REST call. ISV/IB trading accounts are provisioned when KYC is approved — see [Accounts](/partners/onboarding/accounts). Market-maker accounts are provisioned during onboarding.
</Info>

## Endpoints

| Method | Endpoint       | Description                                  |
| ------ | -------------- | -------------------------------------------- |
| `GET`  | `/v1/whoami`   | Get current user and firm info               |
| `GET`  | `/v1/accounts` | List accounts the caller may use to trade    |
| `GET`  | `/v1/users`    | List users the caller may trade on behalf of |

## Account Hierarchy

```
Firm
└── Users
    └── Accounts
        └── Positions & Orders
```

* **Firm**: Your organization
* **Users**: People or participant identities that can trade
* **Accounts**: Trading accounts belonging to those users

## User vs Account

| Entity      | Description                                   |
| ----------- | --------------------------------------------- |
| **User**    | A person with identity (KYC verified)         |
| **Account** | A trading account with balances and positions |

A user can have multiple accounts (e.g., for different strategies or purposes).

## Common Use Cases

1. **Identity** - Call `GET /v1/whoami` to confirm the authenticated user and firm
2. **Account lookup** - Call `GET /v1/accounts` to list trading accounts and display names
3. **Act on behalf of a user** - Call `GET /v1/users` for the participant names you may trade as
