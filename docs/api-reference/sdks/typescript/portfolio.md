> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Portfolio

> View positions and trading activity

<Note>Requires authentication.</Note>

The Portfolio resource provides access to your trading positions and activity history.

## Methods

| Method                | Endpoint                       | Description           |
| --------------------- | ------------------------------ | --------------------- |
| `positions(params?)`  | `GET /v1/portfolio/positions`  | Get trading positions |
| `activities(params?)` | `GET /v1/portfolio/activities` | Get activity history  |

***

## positions

Get your current trading positions. Returns a map of market slug to position data.

```typescript theme={null}
const positions = await client.portfolio.positions();

for (const [slug, pos] of Object.entries(positions.positions)) {
  const meta = pos.marketMetadata;
  console.log(meta.title);
  console.log(`  Net Position: ${pos.netPositionDecimal}`);
  console.log(`  Cost: $${pos.cost.value}`);
  console.log(`  Cash Value: $${pos.cashValue.value}`);
}
```

### Parameters

| Parameter | Type   | Description       |
| --------- | ------ | ----------------- |
| `cursor`  | string | Pagination cursor |
| `limit`   | number | Maximum results   |

### Position Fields

| Field                 | Type    | Description                                                   |
| --------------------- | ------- | ------------------------------------------------------------- |
| `netPositionDecimal`  | string  | Net quantity in contracts (positive = long, negative = short) |
| `qtyBoughtDecimal`    | string  | Total quantity bought in contracts                            |
| `qtySoldDecimal`      | string  | Total quantity sold in contracts                              |
| `qtyAvailableDecimal` | string  | Quantity available to trade in contracts                      |
| `netPosition`         | string  | Deprecated rounded quantity; use `netPositionDecimal`         |
| `qtyBought`           | string  | Deprecated rounded quantity; use `qtyBoughtDecimal`           |
| `qtySold`             | string  | Deprecated rounded quantity; use `qtySoldDecimal`             |
| `cost`                | Amount  | Total cost basis                                              |
| `realized`            | Amount  | Realized profit/loss                                          |
| `cashValue`           | Amount  | Current unrealized value                                      |
| `qtyAvailable`        | string  | Deprecated rounded quantity; use `qtyAvailableDecimal`        |
| `expired`             | boolean | Whether position has expired                                  |
| `marketMetadata`      | object  | Market information                                            |

***

## activities

Get your trading activity history including trades, settlements, deposits, and withdrawals.

```typescript theme={null}
const activities = await client.portfolio.activities({ limit: 20 });

for (const act of activities.activities) {
  console.log(`${act.type}: ${JSON.stringify(act.trade ?? act.accountBalanceChange)}`);
}
```

### Parameters

| Parameter    | Type      | Description                                                 |
| ------------ | --------- | ----------------------------------------------------------- |
| `limit`      | number    | Maximum results                                             |
| `cursor`     | string    | Pagination cursor                                           |
| `types`      | string\[] | Filter by activity types                                    |
| `marketSlug` | string    | Filter by market                                            |
| `sortOrder`  | string    | `SORT_ORDER_DESCENDING` (default) or `SORT_ORDER_ASCENDING` |

### Activity Types

| Type                                     | Nested Field           | Description                              |
| ---------------------------------------- | ---------------------- | ---------------------------------------- |
| `ACTIVITY_TYPE_TRADE`                    | `trade`                | Trade execution                          |
| `ACTIVITY_TYPE_POSITION_RESOLUTION`      | `positionResolution`   | Market settlement                        |
| `ACTIVITY_TYPE_ACCOUNT_DEPOSIT`          | `accountBalanceChange` | Deposit                                  |
| `ACTIVITY_TYPE_ACCOUNT_ADVANCED_DEPOSIT` | `accountBalanceChange` | Advance issued against a pending deposit |
| `ACTIVITY_TYPE_ACCOUNT_WITHDRAWAL`       | `accountBalanceChange` | Withdrawal                               |
| `ACTIVITY_TYPE_TRANSFER`                 | `accountBalanceChange` | Internal transfer                        |
| `ACTIVITY_TYPE_REFERRAL_BONUS`           | `accountBalanceChange` | Referral incentive credit                |
| `ACTIVITY_TYPE_TAKER_FEE_REBATE`         | `accountBalanceChange` | Taker fee rebate credit                  |
| `ACTIVITY_TYPE_LIQUIDITY_PROGRAM`        | `accountBalanceChange` | Liquidity program payout                 |

### Trade Fields

| Field         | Type    | Description                                   |
| ------------- | ------- | --------------------------------------------- |
| `id`          | string  | Trade ID                                      |
| `marketSlug`  | string  | Market slug                                   |
| `price`       | Amount  | Trade price                                   |
| `qtyDecimal`  | string  | Trade quantity in contracts                   |
| `qty`         | string  | Deprecated rounded quantity; use `qtyDecimal` |
| `isAggressor` | boolean | True if taker                                 |
| `realizedPnl` | Amount  | Realized P\&L                                 |

<Tip>
  For real-time position updates, use the [WebSocket](/api-reference/sdks/typescript/websocket) with `SUBSCRIPTION_TYPE_POSITION` instead of polling.
</Tip>
