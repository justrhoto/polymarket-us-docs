> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Account

> View account balances and buying power

<Note>Requires authentication.</Note>

The Account resource provides access to your account balances and financial information.

## Methods

| Method       | Endpoint                   | Description          |
| ------------ | -------------------------- | -------------------- |
| `balances()` | `GET /v1/account/balances` | Get account balances |

***

## balances

Retrieve your current account balances, buying power, and pending withdrawals.

```typescript theme={null}
const balances = await client.account.balances();

console.log(`Current Balance: $${balances.currentBalance}`);
console.log(`Buying Power: $${balances.buyingPower}`);
console.log(`Open Orders: $${balances.openOrders}`);
```

### Response Fields

| Field                | Type   | Description                       |
| -------------------- | ------ | --------------------------------- |
| `currentBalance`     | number | Current fiat currency balance     |
| `currency`           | string | Currency code (e.g., "USD")       |
| `buyingPower`        | number | Capital available for trading     |
| `assetNotional`      | number | Total notional value of positions |
| `assetAvailable`     | number | Available collateral value        |
| `openOrders`         | number | Value tied up in open orders      |
| `unsettledFunds`     | number | Unsettled funds not yet available |
| `marginRequirement`  | number | Required margin for positions     |
| `pendingWithdrawals` | array  | Active withdrawal requests        |

### Buying Power

The `buyingPower` field represents unencumbered capital available for trading:

```
buyingPower = currentBalance + assetAvailable - openOrders - marginRequirement
```

<Tip>
  For real-time balance updates, use the [WebSocket](/api-reference/sdks/typescript/websocket) with `SUBSCRIPTION_TYPE_ACCOUNT_BALANCE` instead of polling.
</Tip>
