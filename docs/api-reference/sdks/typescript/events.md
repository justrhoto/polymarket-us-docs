> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Events

> Retrieve and filter events

The Events resource provides access to event data. Events contain one or more markets and represent the underlying question or competition being predicted.

## Methods

| Method                 | Endpoint                     | Description                |
| ---------------------- | ---------------------------- | -------------------------- |
| `list(params?)`        | `GET /v1/events`             | List events with filtering |
| `retrieve(id)`         | `GET /v1/events/{id}`        | Get event by ID            |
| `retrieveBySlug(slug)` | `GET /v1/events/slug/{slug}` | Get event by URL slug      |

***

## list

Fetch a paginated list of events with optional filters.

```typescript theme={null}
const events = await client.events.list({
  limit: 10,
  offset: 0,
  active: true,
  categories: ['sports', 'crypto'],
});

for (const event of events.events) {
  console.log(`${event.title} - ${event.markets?.length ?? 0} markets`);
}
```

### Parameters

| Parameter    | Type      | Description                              |
| ------------ | --------- | ---------------------------------------- |
| `limit`      | number    | Maximum results to return (default: 100) |
| `offset`     | number    | Number of results to skip for pagination |
| `active`     | boolean   | Filter by active events                  |
| `closed`     | boolean   | Filter by closed events                  |
| `archived`   | boolean   | Filter by archived events                |
| `featured`   | boolean   | Filter featured events only              |
| `categories` | string\[] | Filter by category slugs                 |
| `seriesId`   | number\[] | Filter by series IDs                     |
| `live`       | boolean   | Filter live sports events                |
| `ended`      | boolean   | Filter ended sports events               |

### Response Fields

| Field         | Type    | Description                         |
| ------------- | ------- | ----------------------------------- |
| `id`          | number  | Unique event identifier             |
| `slug`        | string  | URL-friendly identifier             |
| `title`       | string  | Event title                         |
| `description` | string  | Event description                   |
| `category`    | string  | Primary category                    |
| `active`      | boolean | Whether event is active for trading |
| `closed`      | boolean | Whether event is closed             |
| `markets`     | array   | Associated markets                  |

***

## retrieve

Get a single event by its numeric ID.

```typescript theme={null}
const event = await client.events.retrieve(12345);

console.log(`Title: ${event.title}`);
console.log(`Category: ${event.category}`);
console.log(`Markets: ${event.markets?.length ?? 0}`);
```

### Parameters

| Parameter | Type   | Description |
| --------- | ------ | ----------- |
| `id`      | number | Event ID    |

***

## retrieveBySlug

Get an event by its URL slug. Useful when you have the slug from a URL or API response.

```typescript theme={null}
const event = await client.events.retrieveBySlug('super-bowl-2025');

console.log(`Title: ${event.title}`);
for (const market of event.markets ?? []) {
  console.log(`  - ${market.title}: ${market.slug}`);
}
```

### Parameters

| Parameter | Type   | Description    |
| --------- | ------ | -------------- |
| `slug`    | string | Event URL slug |

***

## Sports Event Fields

Sports events include additional real-time data:

| Field          | Type    | Description                 |
| -------------- | ------- | --------------------------- |
| `gameId`       | string  | Sports provider game ID     |
| `live`         | boolean | Whether game is in progress |
| `ended`        | boolean | Whether game has ended      |
| `score`        | object  | Current score               |
| `period`       | string  | Current period/quarter/half |
| `participants` | array   | Teams or players            |

```typescript theme={null}
const events = await client.events.list({ live: true, categories: ['sports'] });

for (const event of events.events) {
  if (event.live) {
    console.log(`${event.title}: ${JSON.stringify(event.score)}`);
  }
}
```
