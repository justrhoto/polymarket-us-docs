> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Combos API Overview

> Create and read combo instruments

A combo is a user-defined instrument with 2–50 legs. Each leg identifies an existing market symbol and whether the combo buys or sells that leg. Combo instruments can trade through normal order entry and can be used as the symbol of an [RFQ](https://docs.polymarket.us/institutional/rfqs/overview.md).

The public `polymarket.v1.ComboAPI` gRPC service creates and reads combo instruments. Each RPC also has a REST endpoint. REST JSON uses lower camel case; protobuf fields use snake case.

## Endpoints

| Method | Endpoint | Scope | Per-firm limit | Description |
| - | - | - | - | - |
| `GET` | `/v1/combos?symbol={symbol}` | `read:orders` | 100 req/sec | Get a combo by exact symbol |
| `POST` | `/v1/combos` | `write:orders` | 1 req/sec | Create or retrieve a combo for a set of legs |

All calls require bearer-token authentication and an acting participant, supplied through `x-participant-id` or the token's `participant_id` claim.

Each method has a separate per-firm rate-limit bucket with one second of burst capacity. See [Rate Limits](https://docs.polymarket.us/trader-guide/rate-limits.md#combos-endpoints).

Separately, combo creation has a participant-wide service quota of 1,000 new instruments per week across all accounts and both Retail and Institutional APIs. The quota resets Monday at 00:00 UTC; returning an existing canonical combo does not consume it.

## Create a Combo

`POST /v1/combos` accepts a list of 2–50 unique legs:

```json theme={null}
{
  "legs": [
    {
      "symbol": "aec-mlb-nyy-bos-2026-07-29-nyy",
      "side": "SIDE_BUY"
    },
    {
      "symbol": "tsc-nba-bos-lal-2026-07-29-207pt5",
      "side": "SIDE_SELL"
    }
  ]
}
```

The component symbols must be open, tradable, supported instruments. The service rejects duplicate symbols and invalid combinations. Treat the combo symbol as opaque: existing combos use `caoc-...` and new combos use `crossd-...`. Within one product, a canonical set of legs always maps to the same symbol; if that combo already exists, `CreateCombo` returns it.

```json theme={null}
{
  "combo": {
    "id": "caoc-...",
    "legs": [
      {
        "symbol": "aec-mlb-nyy-bos-2026-07-29-nyy",
        "side": "SIDE_BUY"
      },
      {
        "symbol": "tsc-nba-bos-lal-2026-07-29-207pt5",
        "side": "SIDE_SELL"
      }
    ],
    "state": "INSTRUMENT_STATE_OPEN",
    "createdTime": "2026-07-29T14:00:00Z",
    "tickSize": 0.001
  }
}
```

## Get a Combo

`GET /v1/combos?symbol=caoc-...` requires the exact combo symbol and returns:

```json theme={null}
{
  "combos": [
    {
      "id": "caoc-...",
      "legs": [
        {
          "symbol": "aec-mlb-nyy-bos-2026-07-29-nyy",
          "side": "SIDE_BUY"
        },
        {
          "symbol": "tsc-nba-bos-lal-2026-07-29-207pt5",
          "side": "SIDE_SELL"
        }
      ],
      "state": "INSTRUMENT_STATE_OPEN",
      "createdTime": "2026-07-29T14:00:00Z",
      "tickSize": 0.001
    }
  ]
}
```

An unknown symbol returns an empty `combos` array. This endpoint does not paginate.

## See Also

> [card] [RFQ API](https://docs.polymarket.us/institutional/rfqs/overview.md)
>
> Create and manage combo RFQs and quotes

> [card] [Combos/RFQ Guide](https://docs.polymarket.us/trader-guide/combos.md)
>
> Maker workflow and quote rules

> [card] [Authentication](https://docs.polymarket.us/trader-guide/authentication.md#api-scopes)
>
> OAuth metadata and required scopes

> [card] [Rate Limits](https://docs.polymarket.us/trader-guide/rate-limits.md)
>
> Endpoint-level request limits


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.