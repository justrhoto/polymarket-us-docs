> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Sports Data

> Sports players, teams, and league data available through the ISV gateway

The ISV gateway exposes sports reference data - players, teams, logos, colors, records, and provider mappings - that complement the exchange-level [Reference Data](/data-guide/reference-data).

## Players Endpoint

```text theme={null}
GET https://gateway.polymarket.us/v1/sports/players
```

Fetch player reference data directly for player props, combos, and provider ID mapping, without loading an event. This is a public endpoint and requires no authentication. It remains supported at v1 and is not deprecated; there is no standalone v2 players lookup endpoint. Player information embedded in `/v2/events` complements this endpoint.

### Query Parameters

Use dotted, camelCase query parameter names. For array filters, repeat the parameter for each value, for example `filters.id=781&filters.id=15877`.

| Parameter                  | Type      | Description                                                                                                                                                                         |
| -------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `limit`                    | int32     | Maximum players to return in list mode. Set an explicit positive limit when paging.                                                                                                 |
| `offset`                   | int32     | Players to skip in list mode. Start at `0` and increase by the requested limit for subsequent pages.                                                                                |
| `filters.id`               | int64\[]  | Internal player IDs. Use this to look up a specific player.                                                                                                                         |
| `filters.teamId`           | int64\[]  | Internal team IDs, such as the `id` returned by `/v1/sports/teams`.                                                                                                                 |
| `filters.name`             | string\[] | Filter by player name.                                                                                                                                                              |
| `filters.abbreviation`     | string\[] | Filter by player abbreviation.                                                                                                                                                      |
| `filters.provider`         | string    | Provider enum, such as `PROVIDER_SPORTSDATAIO`, `PROVIDER_SPORTRADAR`, or `PROVIDER_OPTICODDS`. Selects provider lookup mode when set to a value other than `PROVIDER_UNSPECIFIED`. |
| `filters.providerPlayerId` | string\[] | Player IDs in the selected provider's namespace. Requires `filters.provider`.                                                                                                       |
| `filters.league`           | string    | Restrict provider lookups to players on teams in this league (for example, `mlb`). Ignored in list mode.                                                                            |

<Note>
  Provider lookup uses only `filters.provider`, `filters.providerPlayerId`, and `filters.league`. It ignores `limit`, `offset`, `filters.id`, `filters.teamId`, `filters.name`, and `filters.abbreviation`, and returns results sorted by internal player ID. For list mode, leave `filters.provider` unset; `filters.providerPlayerId` and `filters.league` then have no effect.
</Note>

### Examples

List players:

```bash theme={null}
curl -sS 'https://gateway.polymarket.us/v1/sports/players?limit=20' | jq
```

Look up a specific player by internal ID. The response still contains a `players` array; there is no public `/v1/sports/players/{id}` route.

```bash theme={null}
curl -sS --get 'https://gateway.polymarket.us/v1/sports/players' \
  --data-urlencode 'filters.id=781' | jq
```

List players on a team:

```bash theme={null}
curl -sS --get 'https://gateway.polymarket.us/v1/sports/players' \
  --data-urlencode 'filters.teamId=3006' \
  --data-urlencode 'limit=100' | jq
```

Resolve a provider's player ID to an internal player record:

```bash theme={null}
curl -sS --get 'https://gateway.polymarket.us/v1/sports/players' \
  --data-urlencode 'filters.provider=PROVIDER_SPORTSDATAIO' \
  --data-urlencode 'filters.providerPlayerId=10007155' \
  --data-urlencode 'filters.league=mlb' | jq
```

### Response Fields

The response is an object containing a `players` array. No matches return HTTP `200` with `{"players": []}`. There is no total count or next-page token; in list mode, request subsequent offsets until a page contains fewer players than the requested limit.

Each player includes the following fields when available. Internal player and team IDs are serialized as JSON strings because they are protobuf `int64` values; provider IDs are strings in the provider's own namespace.

| Field             | Type      | Description                                                       |
| ----------------- | --------- | ----------------------------------------------------------------- |
| `id`              | string    | Internal player ID, used with `filters.id`.                       |
| `name`            | string    | Player name.                                                      |
| `abbreviation`    | string    | Player abbreviation.                                              |
| `teamId`          | string    | Internal team ID; may be absent.                                  |
| `image`           | string    | Player image URL; may be absent or empty.                         |
| `darkImage`       | string    | Dark-mode player image URL; empty when unavailable.               |
| `providerIds`     | object\[] | Provider references, each containing `provider` and `providerId`. |
| `jerseyNumber`    | int32     | Jersey number; may be absent. `0` is a valid jersey number.       |
| `jerseyImage`     | string    | Jersey image URL; empty when unavailable.                         |
| `jerseyDarkImage` | string    | Dark-mode jersey image URL; empty when unavailable.               |

These are player reference records. A returned player does not imply that player has an active prop market or an eligible combo leg; use event and market data to discover those markets.

## Teams Endpoint

```
GET https://gateway.polymarket.us/v1/sports/teams
```

Returns team data for a given series. Use the `filters.league` parameter to specify the series, which corresponds to the `event_series` value in instrument metadata (e.g., `nfl`, `nba`, `nhl`, `mlb`, `mls`, `cbb`, `cfb`).

### Query Parameters

| Parameter              | Type   | Description                              |
| ---------------------- | ------ | ---------------------------------------- |
| `limit`                | int32  | Maximum number of teams to return        |
| `offset`               | int32  | Number of teams to skip for pagination   |
| `filters.league`       | string | Series to filter by (see examples below) |
| `filters.name`         | string | Filter by team name                      |
| `filters.abbreviation` | string | Filter by team abbreviation              |
| `filters.id`           | int64  | Filter by team ID                        |

### Examples by Series

Substitute the series value in `filters.league` to get teams for different leagues:

| Series | URL                                                                          |
| ------ | ---------------------------------------------------------------------------- |
| NFL    | `https://gateway.polymarket.us/v1/sports/teams?limit=500&filters.league=nfl` |
| NBA    | `https://gateway.polymarket.us/v1/sports/teams?limit=500&filters.league=nba` |
| NHL    | `https://gateway.polymarket.us/v1/sports/teams?limit=500&filters.league=nhl` |
| MLB    | `https://gateway.polymarket.us/v1/sports/teams?limit=500&filters.league=mlb` |
| MLS    | `https://gateway.polymarket.us/v1/sports/teams?limit=500&filters.league=mls` |
| CBB    | `https://gateway.polymarket.us/v1/sports/teams?limit=500&filters.league=cbb` |
| CFB    | `https://gateway.polymarket.us/v1/sports/teams?limit=500&filters.league=cfb` |
| UFC    | `https://gateway.polymarket.us/v1/sports/teams?limit=500&filters.league=ufc` |
| UCL    | `https://gateway.polymarket.us/v1/sports/teams?limit=500&filters.league=ucl` |
| EPL    | `https://gateway.polymarket.us/v1/sports/teams?limit=500&filters.league=epl` |
| ATP    | `https://gateway.polymarket.us/v1/sports/teams?limit=500&filters.league=atp` |
| WTA    | `https://gateway.polymarket.us/v1/sports/teams?limit=500&filters.league=wta` |

### Response Fields

Each team object includes:

| Field          | Type   | Description                            |
| -------------- | ------ | -------------------------------------- |
| `id`           | string | Internal team ID                       |
| `name`         | string | Full team name (e.g., "Buffalo Bills") |
| `abbreviation` | string | Team abbreviation (e.g., `buf`)        |
| `league`       | string | Series identifier (e.g., `nfl`)        |
| `record`       | string | Current win-loss record                |
| `logo`         | string | URL to team logo image                 |
| `alias`        | string | Team nickname                          |
| `colorPrimary` | string | Team primary color (hex)               |
| `conference`   | string | Conference or division                 |
| `providerRefs` | array  | External data provider ID mappings     |

## Events Endpoint

```
GET https://gateway.polymarket.us/v2/leagues/{slug}/events
```

Returns active events for a given league.

### Query Parameters

| Parameter | Type    | Description                        |
| --------- | ------- | ---------------------------------- |
| `limit`   | integer | Maximum number of events to return |
| `active`  | boolean | Filter to active events            |
| `closed`  | boolean | Filter by closed status            |

### Examples by League

| League | URL                                                                                       |
| ------ | ----------------------------------------------------------------------------------------- |
| NFL    | `https://gateway.polymarket.us/v2/leagues/nfl/events?limit=1000&active=true&closed=false` |
| NBA    | `https://gateway.polymarket.us/v2/leagues/nba/events?limit=1000&active=true&closed=false` |
| NHL    | `https://gateway.polymarket.us/v2/leagues/nhl/events?limit=1000&active=true&closed=false` |
| MLB    | `https://gateway.polymarket.us/v2/leagues/mlb/events?limit=1000&active=true&closed=false` |
| MLS    | `https://gateway.polymarket.us/v2/leagues/mls/events?limit=1000&active=true&closed=false` |
| CBB    | `https://gateway.polymarket.us/v2/leagues/cbb/events?limit=1000&active=true&closed=false` |
| CFB    | `https://gateway.polymarket.us/v2/leagues/cfb/events?limit=1000&active=true&closed=false` |
| UFC    | `https://gateway.polymarket.us/v2/leagues/ufc/events?limit=1000&active=true&closed=false` |
| UCL    | `https://gateway.polymarket.us/v2/leagues/ucl/events?limit=1000&active=true&closed=false` |
| EPL    | `https://gateway.polymarket.us/v2/leagues/epl/events?limit=1000&active=true&closed=false` |
| ATP    | `https://gateway.polymarket.us/v2/leagues/atp/events?limit=1000&active=true&closed=false` |
| WTA    | `https://gateway.polymarket.us/v2/leagues/wta/events?limit=1000&active=true&closed=false` |

## When Sports Markets Use Subjects Instead of Teams

Teams are used for standard game markets (moneylines, spreads, totals) where two teams are competing in a specific game. In these cases, team data is attached directly to the event as participants.

However, non-championship futures markets for sports — such as MVP awards, season win totals, and other prop futures that aren't tied to a specific game outcome — use **subjects** instead of teams. Subjects represent the individual player, team, or entity that the futures market is about.
