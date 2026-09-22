> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Sports

> Sports configuration and team data

The Sports resource provides access to sports configuration and team information from data providers.

## Methods

| Method           | Endpoint                        | Description           |
| ---------------- | ------------------------------- | --------------------- |
| `list()`         | `GET /v1/sports`                | List all sports       |
| `teams(params?)` | `GET /v1/sports/teams/provider` | Get teams by provider |

***

## list

Get all available sports and their configuration.

```typescript theme={null}
const sports = await client.sports.list();

for (const sport of sports.sports) {
  console.log(`${sport.sport} - Operational: ${sport.isOperational}`);
}
```

### Response Fields

| Field                 | Type    | Description                             |
| --------------------- | ------- | --------------------------------------- |
| `sport`               | string  | Sport name                              |
| `image`               | string  | Sport image URL                         |
| `isOperational`       | boolean | Whether sport is operational            |
| `automaticResolution` | boolean | Whether automatic resolution is enabled |
| `ordering`            | string  | Display ordering                        |

***

## teams

Get team information from a specific data provider.

```typescript theme={null}
const teams = await client.sports.teams({
  provider: 'PROVIDER_SPORTRADAR',
  league: 'NFL',
});

for (const team of teams.teams) {
  console.log(`${team.name} (${team.abbreviation})`);
  console.log(`  Conference: ${team.conference}`);
  console.log(`  Record: ${team.record}`);
}
```

### Parameters

| Parameter  | Type      | Description                       |
| ---------- | --------- | --------------------------------- |
| `provider` | string    | Data provider (see below)         |
| `league`   | string    | League name (NFL, NBA, MLB, etc.) |
| `teamIds`  | number\[] | Filter by specific team IDs       |

### Data Providers

| Provider                | Description   |
| ----------------------- | ------------- |
| `PROVIDER_SPORTRADAR`   | Sportradar    |
| `PROVIDER_SPORTSDATAIO` | SportsData.io |

### Team Fields

| Field          | Type   | Description        |
| -------------- | ------ | ------------------ |
| `id`           | number | Team identifier    |
| `name`         | string | Team name          |
| `abbreviation` | string | Team abbreviation  |
| `league`       | string | League name        |
| `conference`   | string | Conference name    |
| `record`       | string | Team record        |
| `ranking`      | number | Team ranking       |
| `logo`         | string | Logo URL           |
| `colorPrimary` | string | Primary team color |
