> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Tier API Overview

> Read the maker and taker fee tiers of an account

## Endpoints

| Method | Endpoint | Description |
| - | - | - |
| `GET` | `/v1/tier/account-tiers` | Get the maker fee tier and the taker fee tier of an account |

Requires a bearer token with `read:accounts` scope. No `x-participant-id` header is required. See [Authentication](https://docs.polymarket.us/trader-guide/authentication.md).

## Query Parameters

| Parameter | Description |
| - | - |
| `account` | Required. Fully qualified account name, for example `firms/YOUR_FIRM/accounts/YOUR_ACCOUNT`. Use [`GET /v1/accounts`](https://docs.polymarket.us/institutional/accounts/overview) to find the accounts you can use. |

## Response Fields

| Field | Description |
| - | - |
| `makerTier` | Maker fee tier of the account, from 1 to 9. Tier 1 is the default tier. |
| `takerTier` | Taker fee tier of the account, from 1 to 9. Tier 1 is the default tier. |

The caller must be permitted to trade the account. Otherwise the call returns `403`, also for an account that does not exist. A missing or malformed `account` returns `400`.

For the fee schedule and how tiers are set, see [Fee Schedule](https://docs.polymarket.us/fees.md).

## Example Usage

```bash theme={null}
curl 'https://api.prod.polymarketexchange.com/v1/tier/account-tiers?account=firms/YOUR_FIRM/accounts/YOUR_ACCOUNT' \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

Example response:

```json theme={null}
{
  "makerTier": 1,
  "takerTier": 2
}
```

For gRPC, see [Account Tiers](https://docs.polymarket.us/streaming-endpoints/proto-reference.md#account-tiers).


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.