> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Series

> Browse event series

The Series resource provides access to series information. Series group related events together (e.g., NFL games, election cycles, daily crypto markets).

## Methods

| Method          | Endpoint                 | Description      |
| --------------- | ------------------------ | ---------------- |
| `list(params?)` | `GET /v1/series`         | List all series  |
| `retrieve(id)`  | `GET /v1/series/id/{id}` | Get series by ID |

***

## list

Get a list of all series with optional filtering.

```typescript theme={null}
const series = await client.series.list({
  active: true,
  limit: 20,
});

for (const s of series.series) {
  console.log(`${s.title} (${s.recurrence})`);
}
```

### Parameters

| Parameter    | Type      | Description                                |
| ------------ | --------- | ------------------------------------------ |
| `limit`      | number    | Maximum results                            |
| `offset`     | number    | Pagination offset                          |
| `slug`       | string\[] | Filter by slugs                            |
| `active`     | boolean   | Filter by active status                    |
| `closed`     | boolean   | Filter by closed status                    |
| `archived`   | boolean   | Filter by archived status                  |
| `recurrence` | string    | Filter by recurrence (daily, weekly, etc.) |

### Response Fields

| Field         | Type    | Description              |
| ------------- | ------- | ------------------------ |
| `id`          | number  | Unique series identifier |
| `slug`        | string  | URL-friendly identifier  |
| `title`       | string  | Series title             |
| `subtitle`    | string  | Series subtitle          |
| `description` | string  | Series description       |
| `seriesType`  | string  | Type of series           |
| `recurrence`  | string  | Recurrence pattern       |
| `active`      | boolean | Whether series is active |
| `volume`      | string  | Total trading volume     |
| `liquidity`   | string  | Current liquidity        |

***

## retrieve

Get a single series by ID.

```typescript theme={null}
const series = await client.series.retrieve(123);

console.log(`Title: ${series.title}`);
console.log(`Description: ${series.description}`);
console.log(`Recurrence: ${series.recurrence}`);
```
