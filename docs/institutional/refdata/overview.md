> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Reference Data API Overview

> Instruments, symbols, and market metadata

## Endpoints

### Instruments & Symbols

| Method | Endpoint                  | Description                                  |
| ------ | ------------------------- | -------------------------------------------- |
| `POST` | `/v1/refdata/symbols`     | List all symbols                             |
| `POST` | `/v1/refdata/instruments` | List instruments (filter by symbols in body) |
| `POST` | `/v1/refdata/metadata`    | Get instrument metadata                      |

### Sports Data

| Method | Endpoint                            | Description                        |
| ------ | ----------------------------------- | ---------------------------------- |
| `GET`  | `/v1/refdata/sports`                | List all sports with metadata      |
| `GET`  | `/v1/refdata/sports/teams`          | List teams with optional filtering |
| `GET`  | `/v1/refdata/sports/teams/provider` | Get teams by provider-specific IDs |

See [Sports Reference Data](/api-reference/refdata/sports) for detailed documentation.

<Info>
  **No Participant ID Required**

  These endpoints only require Auth0 JWT authentication with `read:instruments` scope. You do not need to provide the `x-participant-id` header or complete KYC onboarding to access reference data.
</Info>

<Info>
  **No GET endpoint for single instrument**

  To get a single instrument, use `POST /v1/refdata/instruments` with `{"symbols": ["SYMBOL-NAME"]}` in the body.
</Info>

***

## Filtering Instruments

The `/v1/refdata/instruments` endpoint supports configurable query parameters to filter and paginate results.

### Request Parameters

| Parameter        | Type      | Description                                                                          |
| ---------------- | --------- | ------------------------------------------------------------------------------------ |
| `pageSize`       | int32     | Results per page (default: 50, max: 1000)                                            |
| `pageToken`      | string    | Pagination cursor from previous response                                             |
| `symbols`        | string\[] | Filter by exact instrument symbols                                                   |
| `productId`      | string    | Filter by exact product ID                                                           |
| `tradableFilter` | enum      | `TRADABLE_FILTER_TRADABLE`, `TRADABLE_FILTER_NON_TRADABLE`, or `TRADABLE_FILTER_ALL` |
| `states`         | enum\[]   | Filter by instrument states (multiple values = OR logic)                             |
| `eventSeries`    | string    | Filter by event series (e.g., `cbb`, `nfl`, `nba`)                                   |
| `eventCategory`  | string    | Filter by event category (e.g., `SPR`, `POL`, `CUL`)                                 |
| `clearingSym`    | string    | Filter by clearing symbol (e.g., `AEC-NFL`, `AEC-BASKETBALL`)                        |
| `startTimeGte`   | string    | Instruments starting on or after date (format: `YYYY-MM-DD`)                         |
| `startTimeLte`   | string    | Instruments starting on or before date                                               |
| `endTimeGte`     | string    | Instruments expiring on or after date                                                |
| `endTimeLte`     | string    | Instruments expiring on or before date                                               |

<Info>
  All parameter names accept both camelCase and snake\_case (e.g., `eventSeries` and `event_series` are equivalent). This is standard protobuf JSON serialization behavior.
</Info>

<Warning>
  **Protobuf Enum Caution**

  The `states` and `tradableFilter` parameters use protobuf enums. Unrecognized values (typos, made-up states, etc.) **silently map to the default enum value** and return misleading results - they do not error or return empty. Only use the exact values documented here.
</Warning>

### Response Fields

| Field           | Type    | Description                                    |
| --------------- | ------- | ---------------------------------------------- |
| `instruments`   | array   | List of matching instruments                   |
| `nextPageToken` | string  | Token for next page (empty if no more results) |
| `eof`           | boolean | True when no more results                      |

### Pagination

Use `pageSize` and `pageToken` to paginate through large result sets.

<CodeGroup>
  ```bash cURL theme={null}
  # First page
  curl -X POST "https://api.preprod.polymarketexchange.com/v1/refdata/instruments" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"pageSize": 100}'

  # Next page (use nextPageToken from previous response)
  curl -X POST "https://api.preprod.polymarketexchange.com/v1/refdata/instruments" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"pageSize": 100, "pageToken": "eyJvIjoxMDB9"}'
  ```

  ```python Python theme={null}
  page_token = None
  all_instruments = []

  while True:
      body = {"pageSize": 100}
      if page_token:
          body["pageToken"] = page_token

      response = requests.post(
          "https://api.preprod.polymarketexchange.com/v1/refdata/instruments",
          headers={"Authorization": f"Bearer {token}"},
          json=body
      )
      data = response.json()
      all_instruments.extend(data["instruments"])

      if data.get("eof", False):
          break
      page_token = data.get("nextPageToken")
      if not page_token:
          break

  print(f"Total instruments: {len(all_instruments)}")
  ```

  ```go Go theme={null}
  var allInstruments []Instrument
  pageToken := ""

  for {
      resp, err := client.ListInstrumentsWithPagination(rest.ListInstrumentsRequest{
          PageSize:  100,
          PageToken: pageToken,
      })
      if err != nil {
          return err
      }

      allInstruments = append(allInstruments, resp.Instruments...)

      if resp.Eof || resp.NextPageToken == "" {
          break
      }
      pageToken = resp.NextPageToken
  }
  ```
</CodeGroup>

### Filtering by State

Filter instruments by their current trading state using the `states` parameter.

```bash theme={null}
curl -X POST "https://api.preprod.polymarketexchange.com/v1/refdata/instruments" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "states": ["INSTRUMENT_STATE_OPEN"],
    "pageSize": 100
  }'
```

You can specify multiple states to match any of them:

```json theme={null}
{
  "states": ["INSTRUMENT_STATE_OPEN", "INSTRUMENT_STATE_SUSPENDED"],
  "pageSize": 100
}
```

### Filtering by Series

Filter instruments by series (e.g., NFL, NBA, US Presidential):

```bash theme={null}
curl -X POST "https://api.preprod.polymarketexchange.com/v1/refdata/instruments" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "event_series": "nba",
    "states": ["INSTRUMENT_STATE_OPEN"],
    "pageSize": 1000
  }'
```

### Filtering by Category

Filter instruments by category (e.g., SPR for sports, POL for politics):

```bash theme={null}
curl -X POST "https://api.preprod.polymarketexchange.com/v1/refdata/instruments" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "event_category": "SPR",
    "states": ["INSTRUMENT_STATE_OPEN"],
    "pageSize": 1000
  }'
```

### Filtering Crypto Instruments

Crypto price instruments use category `CRY` and clearing symbols of the form `CPC-<SYMBOL>`. Filter by series to get one cadence, e.g. every 15-minute Up/Down window:

```bash theme={null}
curl -X POST "https://api.preprod.polymarketexchange.com/v1/refdata/instruments" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "eventCategory": "CRY",
    "clearingSym": "CPC-BTC",
    "eventSeries": "btc-updown-15m",
    "states": ["INSTRUMENT_STATE_OPEN"],
    "pageSize": 1000
  }'
```

Identify each instrument from its `crypto_market_type` metadata; see [Crypto Schema](/trader-guide/crypto-schema).

### Combining Filters

You can combine multiple filters:

```bash theme={null}
curl -X POST "https://api.preprod.polymarketexchange.com/v1/refdata/instruments" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "eventSeries": "nfl",
    "eventCategory": "SPR",
    "clearingSym": "AEC-NFL",
    "states": ["INSTRUMENT_STATE_OPEN"],
    "pageSize": 1000
  }'
```

### Advanced Filtering

The `filter` parameter supports two approaches that can be used independently or combined. When both are provided, results must match both conditions (AND).

**Option A: `whereClause`** - A SQL-like string expression:

```bash theme={null}
curl -X POST "https://api.preprod.polymarketexchange.com/v1/refdata/instruments" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "filter": {
      "whereClause": "symbol LIKE '\''aec-nfl-%'\'' AND state = '\''INSTRUMENT_STATE_OPEN'\''"
    }
  }'
```

Supported operators: `=`, `LIKE` (with `%` wildcard), `AND`

Supported columns:

| Column           | Notes                        |
| ---------------- | ---------------------------- |
| `state`          | Instrument state enum values |
| `symbol`         | Exact match or LIKE pattern  |
| `event_series`   | e.g., `'cbb'`, `'nfl'`       |
| `event_category` | e.g., `'SPR'`                |
| `clearing_sym`   | e.g., `'AEC-BASKETBALL'`     |
| `clearing_house` | e.g., `'QCC'`                |
| `product_id`     | Product identifier           |

<Warning>
  Do **not** use `instrument_product`, `outcome_type`, or `event_subcategory` in `whereClause` - these cause HTTP 500 errors. The column `event_id` is accepted but returns 0 results for known values.
</Warning>

**Option B: `fieldFilters`** - Structured, type-safe filters:

```json theme={null}
{
  "filter": {
    "fieldFilters": [
      {
        "field": "event_series",
        "operator": "FILTER_OPERATOR_EQ",
        "stringValue": "nfl"
      },
      {
        "field": "state",
        "operator": "FILTER_OPERATOR_IN",
        "stringList": {
          "values": ["INSTRUMENT_STATE_OPEN", "INSTRUMENT_STATE_PREOPEN"]
        }
      }
    ]
  }
}
```

Each field filter has a `field` name, an `operator`, and a typed value (`stringValue` or `stringList`). Multiple entries are ANDed together. The same columns supported in `whereClause` work in `fieldFilters`.

**Available operators:**

| Operator               | Description                     | Value field                        |
| ---------------------- | ------------------------------- | ---------------------------------- |
| `FILTER_OPERATOR_EQ`   | Exact match                     | `stringValue`                      |
| `FILTER_OPERATOR_IN`   | Match any in list               | `stringList` (`{"values": [...]}`) |
| `FILTER_OPERATOR_LIKE` | SQL LIKE pattern (`%` wildcard) | `stringValue`                      |

***

## Instrument Data

Each instrument includes:

| Field                      | Type                   | Description                                                         |
| -------------------------- | ---------------------- | ------------------------------------------------------------------- |
| `symbol`                   | string                 | Unique trading symbol                                               |
| `tickSize`                 | double                 | Minimum price increment                                             |
| `baseCurrency`             | string                 | Base currency (e.g., `"USD"`)                                       |
| `multiplier`               | double                 | Contract multiplier                                                 |
| `minimumTradeQty`          | string (int64)         | Minimum order quantity                                              |
| `startDate`                | Date                   | Market start date (`{year, month, day}`)                            |
| `expirationDate`           | Date                   | Expiration date                                                     |
| `terminationDate`          | Date or null           | Termination date (null when not set)                                |
| `tradingSchedule`          | TradingHours\[]        | Trading schedule segments (empty array when none)                   |
| `description`              | string                 | Human-readable instrument description                               |
| `clearingHouse`            | string                 | Clearing house code (e.g., `"QCC"`)                                 |
| `minimumUnaffiliatedFirms` | string (int64)         | Minimum unaffiliated firms requirement                              |
| `nonTradable`              | boolean                | Whether instrument is non-tradable                                  |
| `jsonAttributes`           | string                 | Additional JSON attributes (empty when unused)                      |
| `productId`                | string                 | Product identifier                                                  |
| `priceLimit`               | PriceLimit             | Price limits (`{low, high, lowSet, highSet, ...}`)                  |
| `orderSizeLimit`           | OrderSizeLimit or null | Order size limits (null when not set)                               |
| `expirationTime`           | TimeOfDay              | Expiration time of day (`{hours, minutes, seconds}`)                |
| `tradeSettlementPeriod`    | string (int64)         | Settlement period                                                   |
| `state`                    | string (enum)          | Current instrument state (e.g., `"INSTRUMENT_STATE_OPEN"`)          |
| `priceScale`               | string (int64)         | Price scale divisor for converting integer prices to decimals       |
| `fractionalQtyScale`       | string (int64)         | Fractional quantity scale                                           |
| `settlementCurrency`       | string                 | Reserved for future use                                             |
| `settlementPriceScale`     | string (int64)         | Reserved for future use                                             |
| `metadata`                 | map\<string,string>    | Key-value metadata (sports league, market category, game IDs, etc.) |
| `eventAttributes`          | EventAttributes        | Event resolution details (`{question, payoutValue, ...}`)           |
| `createTime`               | string (Timestamp)     | Instrument creation time (RFC 3339)                                 |
| `updateTime`               | string (Timestamp)     | Last update time (RFC 3339)                                         |

<Warning>
  **Integer Fields Encoded as Strings in JSON**

  Fields typed as `int64` in the protocol buffer definition (such as `minimumTradeQty`, `priceScale`, `fractionalQtyScale`, `priceLimit.low`, `priceLimit.high`) are serialized as **strings** in JSON responses per the proto3 JSON specification. Parse these values as numbers in your client code.

  For example, `"priceScale": "100"` is the string `"100"`, not the number `100`.
</Warning>

## Instrument States

### Primary State Flow

| State                                               | Description                                                                                                                                                                                                      |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PENDING`                                           | Initial state for a newly created instrument which has not yet begun trading.                                                                                                                                    |
| `OPEN`                                              | In this state, the instrument is open for continuous order entry and matching.                                                                                                                                   |
| `CLOSED`                                            | In this state, orders can not be entered, modified, or canceled, and no matching occurs. Any existing Day orders will be expired.                                                                                |
| `EXPIRED`                                           | An instrument moves to this state when its Expiration Date/Time is reached. In this state, any resting orders are expired and no new orders can be entered.                                                      |
| `TERMINATED`                                        | When an instrument's Termination Date is reached, the order book is removed from the matching engine, orders are canceled, and positions are closed. Historical data will still remain in Polymarket US ledgers. |

### Exception States

| State                                               | Description                                                                                   |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `SUSPENDED`                                         | Orders can be canceled but no matching occurs, and no order entry or modification is allowed. |
| `HALTED`                                            | This state is similar to SUSPENDED, with the exception that orders cannot be canceled.        |

### Other Possible States

| State                                               | Description                                                                                                                                                                                                                                                                                       |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PREOPEN`                                           | Orders can be entered and modified, but no matching occurs. When the instrument transitions to an OPEN state, the orders entered during PREOPEN will match at a single opening price that is automatically determined by an algorithm that is designed to maximize the volume traded at the open. |
| `MATCH_AND_CLOSE_AUCTION`                           | This state is similar to PREOPEN, with the exception that matching will occur upon the transition of this state to any other state. This state is useful if you want matching to occur at the end of the state, but you don't want the instrument to be open after.                               |

## Price Scale

Prices in the API are represented as integers. Divide by `priceScale` to get decimal prices:

```python theme={null}
decimal_price = int_price / instrument.price_scale
# Example: 50 / 100 = $0.50
```

<Tip>
  **Cache Reference Data**

  Instrument metadata changes infrequently. Cache reference data locally and refresh periodically (e.g., daily or on startup) rather than fetching for every request.
</Tip>

## Usage Notes

* Reference data is static during a trading session
* Use `/v1/refdata/instruments` to get `priceScale` for price conversions
* Instrument states change based on market schedule
