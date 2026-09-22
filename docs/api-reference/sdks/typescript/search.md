> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Search

> Search for events and markets

The Search resource provides full-text search across events and markets.

## Methods

| Method           | Endpoint         | Description               |
| ---------------- | ---------------- | ------------------------- |
| `query(params?)` | `GET /v1/search` | Search events and markets |

***

## query

Search for events and markets by text query.

```typescript theme={null}
const results = await client.search.query({
  query: 'bitcoin',
  limit: 10,
});

for (const event of results.events) {
  console.log(event.title);
  for (const market of event.markets ?? []) {
    console.log(`  - ${market.question}`);
  }
}
```

### Parameters

| Parameter    | Type      | Description                |
| ------------ | --------- | -------------------------- |
| `query`      | string    | Search query text          |
| `limit`      | number    | Maximum results to return  |
| `page`       | number    | Page number for pagination |
| `seriesIds`  | number\[] | Filter by series IDs       |
| `marketType` | string\[] | Filter by market types     |
| `status`     | string    | Filter by status           |

### Response

Returns events with their associated markets that match the search query:

```typescript theme={null}
{
  events: [
    {
      id: 123,
      title: 'Bitcoin Price Markets',
      slug: 'bitcoin-price',
      markets: [
        {
          id: 456,
          question: 'Will Bitcoin reach $100k?',
          slug: 'btc-100k-2025',
        },
      ],
    },
  ],
}
```
