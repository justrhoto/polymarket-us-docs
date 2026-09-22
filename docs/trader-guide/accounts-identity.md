> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Accounts & Identity

> Understanding account hierarchy and identity resolution

## Account Hierarchy

The API uses a four-level hierarchy:

```
Clearing Member
  └── Participant Firm (Legal Entity)
       └── User (with specific roles and scopes)
            └── Trading Account (Balances, Positions, Orders)
```

**Clearing Member**: The top-level clearing entity (e.g., `api-acme-clearingmember`)

**Participant Firm**: The onboarded legal entity - your organization (e.g., `api-acme-participantfirm`)

**User**: A user with specific roles and permissions, such as:

* **Trading User** - Can place, modify, and cancel orders (scopes: `read:orders`, `write:orders`, `read:positions`)
* **Drop Copy User** - Read-only access to execution reports (scope: `read:dropcopy`)
* **Other roles** as defined during onboarding

**Trading Account**: A specific account that holds balances, positions, and orders

All trading and risk are scoped to the trading account level. User permissions (scopes) determine what operations each user can perform.

### Example Structure

```
api-acme-clearingmember (Clearing Member)
  │
  └── api-acme-participantfirm (Participant Firm)
      │
      ├── api-acme-trading (Trading User)
      │   ├── read:orders
      │   ├── write:orders
      │   └── read:positions
      │
      └── api-acme-dropcopy (Drop Copy User)
          └── read:dropcopy
```

In this example:

* The clearing member is `api-acme-clearingmember`
* The participant firm is `api-acme-participantfirm`
* Two users exist with different permissions:
  * `api-acme-trading` can read/write orders and read positions
  * `api-acme-dropcopy` can only read drop copy reports

***

## Finding Your Participant ID

Your participant ID is the value you send in the `x-participant-id` header on every
account-scoped request. It has the form `firms/<PARTICIPANT_FIRM>/users/<USER>`.

**You are always given this value — you never discover or construct it.** Where it comes
from depends on who the participant is:

| Participant                                                             | Where the ID comes from                                                                                                                                                                                                       |
| ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Your own trading and drop copy users (institutional/DMA, market makers) | Provided during onboarding, when the users are provisioned for your firm                                                                                                                                                      |
| An end user you onboard through KYC (brokers/partners)                  | Returned as `participantId` once the user's KYC reaches `ACCEPT` — on the [`kyc.approved` webhook](/partners/onboarding/kyc/webhooks) or from [`GET /v1/kyc/status`](/partners/onboarding/kyc/verification-flow#check-status) |

<Warning>
  **Do not assemble a participant ID by hand.** In particular, do not build one from the firm
  reported by `GET /v1/whoami`: the clearing member and the participant firm are different
  levels of the hierarchy above, so the firm shown there is not necessarily the firm segment of
  your participant ID. A participant ID whose firm segment does not match your participant firm
  is rejected as a cross-firm request. Always send the value you were given, unmodified.
</Warning>

If you have lost the value, ask your Polymarket contact rather than reconstructing it. Once
you hold one valid participant ID, `GET /v1/users` will return the rest of your firm's users.

***

## Identity Resolution

Before trading, funding, or reporting, resolve your entitlements using the Accounts API.

### Get Your Firm Identity

```bash theme={null}
GET /v1/whoami
```

Returns information about the authenticated firm, including firm ID, firm name, entitlements and permissions, and associated legal entities.

### List Users

```bash theme={null}
GET /v1/users
```

Returns all users associated with your firm: user IDs, user details, KYC status, and associated trading accounts.

This is a roster read for a caller that is already acting as a participant — it is
account-scoped and **requires the `x-participant-id` header**, so it cannot be used to
discover your first participant ID. See [Finding Your Participant ID](#finding-your-participant-id)
above.

### List Trading Accounts

```bash theme={null}
GET /v1/accounts
```

Returns all trading accounts you have access to: account IDs, account names, account status, balance information, and risk limits.

## Required Identity Resolution

<Warning>
  You must call these APIs before trading, funding, or reporting to ensure you:

  * Know which trading accounts you can access
  * Understand your entitlements
  * Use the correct account IDs in subsequent requests
</Warning>

## Multiple Trading Accounts

**Can a firm control multiple trading accounts?**

Yes. Each trading account has independent balances, independent positions, independent risk limits, and separate order flow.

Use the appropriate account ID in your API requests to specify which account to trade on.

## Authentication vs Authorization

**Authentication** identifies the firm using cryptographic signatures (JWT with private key).

**Authorization** determines which users and trading accounts the firm may act on behalf of.

Just because you're authenticated doesn't mean you can access all accounts - authorization is checked on each request.

## Typical Workflow

1. **Authenticate** - Sign a JWT with your private key to get an access token
2. **Have your participant ID ready** - From onboarding, or from KYC approval for an end user. See [Finding Your Participant ID](#finding-your-participant-id). Send it as `x-participant-id` on every account-scoped request from here on
3. **Call whoami** - Confirm your firm identity and entitlements
4. **List users** - See which users you can manage
5. **List accounts** - See which trading accounts you can access
6. **Trade/Fund/Report** - Use the appropriate account ID in your requests

## Example: Checking Account Access

```python theme={null}
# 1. Get your firm identity
whoami_response = api.get('/v1/whoami')
firm_id = whoami_response['firmId']

# 2. List trading accounts
accounts_response = api.get('/v1/accounts')
trading_accounts = accounts_response['accounts']

# 3. Select account for trading
account_id = trading_accounts[0]['accountId']

# 4. Place order using that account
order_request = {
    'accountId': account_id,
    'instrument': 'tec-nfl-sbw-2026-02-08-kc',
    'side': 'buy',
    'quantity': 100
}
api.post('/v1/trading/orders', order_request)
```

## Account Status

Trading accounts can have different statuses: **Active** (normal trading allowed), **Suspended** (temporarily restricted), **Closed** (no longer active).

Always check account status before attempting to trade.
