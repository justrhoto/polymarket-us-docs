> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Incentives API Overview

> View incentive programs and your earnings

# Incentives API

The Incentives API provides access to active incentive programs and your earned rewards. For details on how incentive programs work, see the [Incentive Programs overview](/incentives/overview).

## Endpoints

| Method | Endpoint                  | Auth     | Description                 |
| ------ | ------------------------- | -------- | --------------------------- |
| `GET`  | `/v1/incentives`          | None     | Get incentive programs      |
| `GET`  | `/v1/incentives/earnings` | Required | Get your incentive earnings |

<Warning>
  **Authentication Required for Earnings**

  The `/v1/incentives/earnings` endpoint requires API key authentication. See the [Authentication guide](/trader-guide/authentication) for details. The `/v1/incentives` endpoint is public and requires no authentication.
</Warning>

## Get Incentive Programs

Returns incentive programs for each market.

```bash theme={null}
GET /v1/incentives?pageSize=10&symbols=aec-nba-bos-nyk-2026-04-01
```

### Query Parameters

Parameter names accept both camelCase (`pageSize`) and snake\_case (`page_size`) forms.

| Parameter        | Type      | Required | Description                                                 |
| ---------------- | --------- | -------- | ----------------------------------------------------------- |
| `pageSize`       | integer   | No       | Number of markets per page                                  |
| `pageToken`      | string    | No       | Pagination token from a previous response's `nextPageToken` |
| `symbols`        | string\[] | No       | Filter by market symbols                                    |
| `orderBy`        | string    | No       | Sort field: `created_at` (default)                          |
| `orderDirection` | string    | No       | Sort direction: `desc` (default) or `asc`                   |
| `statuses`       | string\[] | No       | Filter by status: `active`, `closed`, `pending`             |

### Response

```json theme={null}
{
  "programs": [
    {
      "marketSlug": "aec-nba-bos-nyk-2026-04-01",
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
          "programId": "nba_t1_ml_live",
          "programType": "liquidityProgram",
          "start": "2026-04-01T21:00:00Z",
          "rewardPool": 3000.0,
          "status": "active",
          "discountFactor": 0.35,
          "targetSize": 20000,
          "period": "live",
          "createdAt": "2026-03-28T01:00:00Z"
        }
      ]
    }
  ],
  "nextPageToken": "abc123"
}
```

<Note>
  `end` is omitted when the program's final end time is not known yet, such as an in-progress live game.
</Note>

### IncentiveProgram Fields

| Field         | Type          | Description                       |
| ------------- | ------------- | --------------------------------- |
| `marketSlug`  | string        | Market identifier                 |
| `timePeriods` | TimePeriod\[] | Incentive periods for this market |

### TimePeriod Fields

| Field            | Type    | Description                                                        |
| ---------------- | ------- | ------------------------------------------------------------------ |
| `programId`      | string  | Unique program period identifier                                   |
| `programType`    | string  | Program type (e.g., `liquidityProgram`)                            |
| `start`          | string  | ISO 8601 start timestamp                                           |
| `end`            | string  | ISO 8601 end timestamp. Omitted when the end time is not known yet |
| `rewardPool`     | number  | Total reward pool for this period in USD                           |
| `status`         | string  | `active`, `closed`, or `pending`                                   |
| `discountFactor` | number  | Discount factor for scoring (optional)                             |
| `targetSize`     | integer | Minimum book size to qualify (optional)                            |
| `period`         | string  | Reward period type: `early`, `day_of`, `live`, etc.                |
| `createdAt`      | string  | ISO 8601 timestamp when the program was created                    |

## Get Incentive Earnings

Returns incentive earnings for the authenticated user.

```bash theme={null}
GET /v1/incentives/earnings?startDate=2026-03-21&marketSlug=aec-nba-bos-nyk-2026-04-01
```

### Query Parameters

Parameter names accept both camelCase (`startDate`) and snake\_case (`start_date`) forms.

| Parameter     | Type   | Required | Description                                                |
| ------------- | ------ | -------- | ---------------------------------------------------------- |
| `startDate`   | string | No       | Start date filter (`YYYY-MM-DD`). Defaults to `2026-03-21` |
| `endDate`     | string | No       | End date filter (`YYYY-MM-DD`)                             |
| `marketSlug`  | string | No       | Filter by market                                           |
| `programType` | string | No       | Filter by program type (e.g., `liquidityProgram`)          |

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
      "reward": 142.50,
      "programType": "liquidityProgram",
      "marketSlug": "tsc-nba-ny-okc-2026-03-29-223pt5",
      "date": "2026-03-30",
      "status": "PENDING"
    },
    {
      "reward": 325.97,
      "programType": "liquidityProgram",
      "marketSlug": "aec-cbb-cabap-kan-2026-03-20",
      "date": "2026-03-29",
      "status": "PAID"
    }
  ]
}
```

<Note>
  Each day represents rewards earned midnight to midnight ET. A single market on a single date may return multiple rows — one per payout `status` (`PAID`, `PENDING`, `SKIPPED`). Sum across statuses (or filter to one) when aggregating per market and date.
</Note>

### UserReward Fields

| Field         | Type   | Description                                                                                                     |
| ------------- | ------ | --------------------------------------------------------------------------------------------------------------- |
| `reward`      | number | Reward amount in USD (sum of payouts for this market and date with this status)                                 |
| `programType` | string | Program type (e.g., `liquidityProgram`)                                                                         |
| `marketSlug`  | string | Market identifier                                                                                               |
| `date`        | string | Reward date in Eastern Time (`YYYY-MM-DD`)                                                                      |
| `status`      | string | Payout disposition: `PAID`, `PENDING`, or `SKIPPED`. A single `marketSlug` + `date` may appear once per status. |

## Rate Limits

| Endpoint                      | Rate Limit            |
| ----------------------------- | --------------------- |
| `GET /v1/incentives`          | 5 requests per second |
| `GET /v1/incentives/earnings` | 5 requests per second |
