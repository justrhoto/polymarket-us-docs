---
name: polymarket-us-docs
description: Reference documentation for the Polymarket US API — the CFTC-regulated, USD-settled US prediction exchange (docs.polymarket.us), NOT the international crypto Polymarket. Use when working with api.polymarket.us, gateway.polymarket.us, or polymarketexchange.com endpoints; the polymarket-us SDK for Python or TypeScript; Ed25519 X-PM-* request signing; orders, portfolio, markets, events, sports, RFQs and combos; WebSocket or gRPC streaming; the institutional REST or FIX API; or partner integrations — or whenever the user mentions Polymarket US.
---

# Polymarket US documentation

A local mirror of the complete Polymarket US documentation: 300+ pages plus the OpenAPI
specifications behind every endpoint. Read from here instead of fetching the live site.

## First: make sure this is the right Polymarket

Polymarket US is a fiat-based, CFTC-regulated exchange (DCM and DCO) trading in US dollars. The
international Polymarket (polymarket.com, docs.polymarket.com) is a separate, crypto-based
product with different hosts, authentication, and SDKs. Your training data is mostly about the
international one. Do not carry over from it:

- `clob.polymarket.com`, `gamma-api.polymarket.com`, `ws-subscriptions-clob.polymarket.com`,
  or any other `*.polymarket.com` API host
- `py-clob-client` or other CLOB clients, wallet or EIP-712 signing, USDC, Polygon, token IDs
  or condition IDs

If the user's code uses any of those, they are on the international product, and these docs do
not apply. Say so rather than mixing the two.

## Three API surfaces

Polymarket US has three API surfaces with separate hosts. Check which one an endpoint belongs
to before calling it; `INDEX.md` lists the server for every endpoint.

| Surface | Host | Auth | Start at |
| --- | --- | --- | --- |
| Retail, authenticated (orders, portfolio, account) | `https://api.polymarket.us` | Ed25519-signed `X-PM-Access-Key`, `X-PM-Timestamp`, `X-PM-Signature` | `docs/api-reference/authentication.md` |
| Public market data (markets, events, series, sports, search) | `https://gateway.polymarket.us` | None | `docs/api-reference/introduction.md` |
| Institutional (trading, RFQs, reports, FIX, gRPC) | `https://api.prod.polymarketexchange.com` (pre-prod: `api.preprod.`) | `Authorization: Bearer` token | `docs/institutional/introduction.md` |

Some institutional endpoint pages live under `docs/api-reference/` — for example
`docs/api-reference/trading/insert-order.md`. The file path does not tell you the surface; the
`INDEX.md` section and server column, or the spec named in the page's `yaml` block, do.

## Finding a page

Start with `INDEX.md`. It follows the upstream sidebar order and lists every page by section,
with the HTTP method, path, and server for each endpoint.

To go directly from a documentation URL to a local file, replace `https://docs.polymarket.us/`
with `docs/` and append `.md`:

| Looking for | Read |
| --- | --- |
| Base URLs, auth, rate limits (retail) | `docs/api-reference/introduction.md`, `authentication.md`, `rate-limits.md` |
| A retail or public endpoint | `docs/api-reference/<group>/<operation>.md` |
| The official SDKs | `docs/api-reference/sdks/python/`, `docs/api-reference/sdks/typescript/` |
| WebSocket (retail) | `docs/api-reference/websocket/` |
| Institutional REST, FIX, gRPC | `docs/institutional/`, `docs/institutional/fix-api/`, `docs/streaming-endpoints/` |
| Order, market, and margin concepts | `docs/concepts/`, `docs/market-structure/` |
| Fees and the changelog | `docs/fees.md`, `docs/changelog.md` |
| Exact request/response schemas | `docs/*/oapi-schemas/<name>-schema.json` |

Endpoint pages embed the relevant OpenAPI fragment, including every parameter, schema, and enum.
The full specs are alongside in `oapi-schemas/` directories.

## Using it

Read the specific endpoint page before writing code against an endpoint — field names, enum
values, and required/optional status are exact in these pages and easy to get wrong from memory.
Prices, quantities, and amounts have specific types (for example, prices are `Amount` objects on
some endpoints); check the schema rather than assuming a plain number.

## Caveats

These files are an unmodified mirror, synced nightly; they are not authoritative. For anything
that moves funds, places orders, or affects margin, confirm against the live documentation at
https://docs.polymarket.us. Do not edit files under `docs/` — the next sync overwrites them.
