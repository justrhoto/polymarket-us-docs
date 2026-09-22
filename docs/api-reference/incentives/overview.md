> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Incentives API Overview

> View incentive programs and your earned rewards

# Incentives API

The Incentives API exposes the active incentive programs and the rewards you have earned. For background on how programs work and their reward formulas, see the [Incentive Programs overview](/incentives/overview).

## Base URL

```
https://api.polymarket.us
```

<Note>
  **Field casing.** Query parameters are `snake_case` (e.g. `page_size`). Response bodies are `lowerCamelCase` (e.g. `marketSlug`). Sending a camelCase query parameter (e.g. `pageSize`) is silently ignored and the default is used.
</Note>

## Endpoints

| Method | Endpoint                  | Auth     | Description                 |
| ------ | ------------------------- | -------- | --------------------------- |
| `GET`  | `/v1/incentives`          | Required | Get incentive programs      |
| `GET`  | `/v1/incentives/earnings` | Required | Get your incentive earnings |

<Warning>
  **Authentication**

  Both endpoints require API key authentication — see the [Authentication guide](/api-reference/authentication).
</Warning>

## Get Incentive Programs

Returns active and historical incentive programs grouped by market.

```bash theme={null}
GET /v1/incentives?page_size=10&symbols=aec-nba-bos-nyk-2026-04-01
```

### Query Parameters

| Parameter           | Type      | Required | Description                                                            |
| ------------------- | --------- | -------- | ---------------------------------------------------------------------- |
| `page_size`         | integer   | No       | Number of markets per page. Use with `page_token` for pagination.      |
| `page_token`        | string    | No       | Pagination token from a previous response's `nextPageToken`.           |
| `symbols`           | string\[] | No       | Filter by market symbols.                                              |
| `order_by`          | string    | No       | Sort field. Defaults to `created_at`.                                  |
| `order_direction`   | string    | No       | Sort direction: `asc` or `desc`. Defaults to `desc`.                   |
| `statuses`          | string\[] | No       | Filter by status: `active`, `closed`, or `pending`.                    |
| `program_type`      | string    | No       | Filter by program type, such as `liquidityProgram` or `volumeProgram`. |
| `query`             | string    | No       | Case-insensitive substring match on market slug.                       |
| `instrument_states` | string\[] | No       | Filter by instrument lifecycle state.                                  |
| `category`          | string    | No       | Filter by exact event category.                                        |
| `subcategory`       | string    | No       | Filter by exact event subcategory.                                     |

### Response

```json theme={null}
{
  "programs": [
    {
      "marketSlug": "aec-nba-bos-nyk-2026-04-01",
      "instrumentState": "INSTRUMENT_STATE_OPEN",
      "category": "sports",
      "subcategory": "basketball",
      "eventStartTime": "2026-04-01T23:30:00Z",
      "instrumentProduct": "moneyline",
      "timePeriods": [
        {
          "programId": "nba_t1_ml_early",
          "programType": "liquidityProgram",
          "start": "2026-03-28T04:00:00Z",
          "end": "2026-04-01T21:00:00Z",
          "rewardPool": 3000.0,
          "status": "closed",
          "discountFactor": 0.40,
          "targetSize": 20000,
          "period": "early",
          "createdAt": "2026-03-28T01:00:00Z"
        },
        {
          "programId": "nba_t1_ml_day_of",
          "programType": "volumeProgram",
          "start": "2026-04-01T21:00:00Z",
          "rewardPool": 3000.0,
          "status": "active",
          "minTakerNotional": 100,
          "period": "day_of",
          "createdAt": "2026-03-28T01:00:00Z"
        }
      ]
    }
  ],
  "nextPageToken": "abc123"
}
```

<Note>
  Ongoing programs omit `end` until an end time is set.
</Note>

### IncentiveProgram Fields

| Field               | Type          | Description                                |
| ------------------- | ------------- | ------------------------------------------ |
| `marketSlug`        | string        | Market identifier                          |
| `timePeriods`       | TimePeriod\[] | Incentive periods for this market          |
| `instrumentState`   | string        | Exchange lifecycle state of the instrument |
| `category`          | string        | Event category from instrument metadata    |
| `subcategory`       | string        | Event subcategory from instrument metadata |
| `eventStartTime`    | string        | Event start time from instrument metadata  |
| `instrumentProduct` | string        | Product from instrument metadata           |

### TimePeriod Fields

| Field              | Type    | Description                                                     |
| ------------------ | ------- | --------------------------------------------------------------- |
| `programId`        | string  | Unique program period identifier                                |
| `programType`      | string  | Program type (e.g. `liquidityProgram`)                          |
| `start`            | string  | ISO 8601 start timestamp                                        |
| `end`              | string  | ISO 8601 end timestamp (optional; omitted for ongoing programs) |
| `rewardPool`       | number  | Total reward pool for this period in USD                        |
| `status`           | string  | `active`, `closed`, or `pending`                                |
| `discountFactor`   | number  | Discount factor for scoring (optional; omitted if unset)        |
| `targetSize`       | integer | Minimum book size to qualify (optional; omitted if unset)       |
| `period`           | string  | Reward period type: `early`, `day_of`, `live`, etc.             |
| `createdAt`        | string  | ISO 8601 timestamp when the program was created                 |
| `minTakerNotional` | integer | Minimum taker notional for volume programs (optional)           |

## Get Incentive Earnings

Returns rewards earned by the authenticated caller. Each entry sums all payouts for a single `(market, date)` pair, where `date` is in Eastern Time.

```bash theme={null}
GET /v1/incentives/earnings?start_date=2026-03-21&market_slug=aec-nba-bos-nyk-2026-04-01
```

### Query Parameters

| Parameter      | Type   | Required | Description                                                   |
| -------------- | ------ | -------- | ------------------------------------------------------------- |
| `start_date`   | string | No       | Start date filter (`YYYY-MM-DD`). Defaults to program launch. |
| `end_date`     | string | No       | End date filter (`YYYY-MM-DD`). Omit for through-today.       |
| `market_slug`  | string | No       | Filter by market slug.                                        |
| `program_type` | string | No       | Filter by program type (e.g. `liquidityProgram`).             |

### Response

```json theme={null}
{
  "rewards": [
    {
      "reward": 1828.62,
      "programType": "liquidityProgram",
      "marketSlug": "tsc-nba-ny-okc-2026-03-29-223pt5",
      "date": "2026-03-30",
      "status": "PAID"
    },
    {
      "reward": 325.97,
      "programType": "liquidityProgram",
      "marketSlug": "aec-cbb-cabap-kan-2026-03-20",
      "date": "2026-03-29",
      "status": "PENDING"
    }
  ]
}
```

<Note>
  Each daily entry represents rewards earned from midnight-to-midnight ET. Callers with no rewards receive `{"rewards":[]}`.
</Note>

### UserReward Fields

| Field         | Type   | Description                                                            |
| ------------- | ------ | ---------------------------------------------------------------------- |
| `reward`      | number | Reward amount in USD (sum of all payouts for this market on this date) |
| `programType` | string | Program type (e.g. `liquidityProgram`)                                 |
| `marketSlug`  | string | Market identifier                                                      |
| `date`        | string | Reward date in Eastern Time (`YYYY-MM-DD`)                             |
| `status`      | string | Payout disposition: `PAID`, `PENDING`, or `SKIPPED`                    |

## Rate Limits

| Endpoint                      | Rate Limit          |
| ----------------------------- | ------------------- |
| `GET /v1/incentives`          | 5 requests / second |
| `GET /v1/incentives/earnings` | 5 requests / second |
