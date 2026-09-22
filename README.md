# polymarket-us-docs

An unofficial, LLM-friendly, auto-updating Markdown mirror of the [Polymarket US
documentation](https://docs.polymarket.us/api-reference/introduction).

**[Browse the index →](INDEX.md)**

300+ pages covering the retail and public REST APIs, WebSocket and gRPC streaming, the
institutional REST and FIX APIs, partner integrations, and the trader help centre, plus the
OpenAPI specifications behind every endpoint page. Refreshed nightly. Every file is stored
byte-for-byte as upstream publishes it, at a path mirroring its upstream URL — so a `git diff`
shows exactly what Polymarket US changed, and nothing else.

## Polymarket US, not Polymarket

This mirrors **Polymarket US**: a fiat-based, CFTC-regulated designated contract market (DCM)
and derivatives clearing organization (DCO), trading in US dollars and available to US
residents. It is **not** the international, crypto-based [Polymarket](https://polymarket.com),
whose documentation lives at [docs.polymarket.com](https://docs.polymarket.com).

The two share a name and little else. Different hosts, different authentication, different
settlement, different SDKs:

|                  | Polymarket US (this mirror)                                        | Polymarket (international)          |
| ---------------- | ------------------------------------------------------------------ | ----------------------------------- |
| Regulation       | CFTC-regulated DCM + DCO                                           | International product               |
| Settlement       | US dollars                                                         | Crypto, on-chain                    |
| API hosts        | `api.polymarket.us`, `gateway.polymarket.us`, `*.polymarketexchange.com` | `*.polymarket.com`            |
| Retail auth      | Ed25519-signed `X-PM-*` headers                                    | Wallet-based signing                |
| SDKs             | `polymarket-us` (PyPI, npm)                                        | `py-clob-client` and others         |

Code, answers, or blog posts written for one will not work against the other. That is the main
reason this mirror exists: an agent that knows "Polymarket" from its training data knows the
international product, and needs the US documentation in front of it.

## Why this exists

Pointing an agent at the live documentation means rendering a JavaScript site, paginating a
sidebar, and re-fetching content that rarely changes — and hoping a web search does not return
the international docs instead. Pointing it at this repository means reading local Markdown.
The git history also turns "what changed in the API?" into `git log`.

## Layout

```
INDEX.md                                        generated; grouped by section, with method, path and server per endpoint
docs/api-reference/orders/create-order.md       retail and public API endpoints
docs/api-reference/oapi-schemas/*.json          OpenAPI specs (retail and public API)
docs/institutional/fix-api/*.md                 institutional FIX API
docs/institutional/oapi-schemas/*.json          OpenAPI specs (institutional API)
docs/streaming-endpoints/*.md                   gRPC streaming
docs/learn/..., docs/trader-guide/...           help centre and trader guides
.metadata.json                                  per-file hashes and file count
update.ts                                       the sync script
```

Local paths mirror upstream URLs exactly: replace `https://docs.polymarket.us/` in any
documentation URL with `docs/`, add `.md`, and you have the path in this repository. Nothing
here is reorganised or hand-curated, so nothing here needs a human to decide where a new page
belongs — an upstream restructure sorts itself out unattended, which matters for a job that runs
nightly with nobody watching. Browsing structure lives in the generated `INDEX.md` instead,
where it is disposable.

One upstream quirk worth knowing: some institutional endpoint pages live under
`docs/api-reference/` URLs. `INDEX.md` groups endpoints by the specification they are defined
in, not by URL, and lists each endpoint's server, so the index never puts an institutional
endpoint beside the retail API.

## Use with an AI agent

This repository is also a skill directory. Clone it into your agent's skills folder:

```sh
git clone https://github.com/justrhoto/polymarket-us-docs ~/.claude/skills/polymarket-us-docs
```

Or vendor it into a project, pinned to a commit you control:

```sh
git submodule add https://github.com/justrhoto/polymarket-us-docs docs/polymarket-us
```

## How the sync works

`update.ts` runs nightly via GitHub Actions:

1. **Enumerate** — fetch `llms.txt`, which lists every documentation page and every OpenAPI
   specification. Upstream is a Mintlify site that supports the [llmstxt.org](https://llmstxt.org)
   convention and serves a clean `.md` twin for every page, so there is no HTML scraping and no
   link rewriting anywhere in this repository.
2. **Guard** — if `llms.txt` is unreachable, lists no pages, or lists more than 10% fewer files
   than the last successful run, the job fails and *nothing is written*. A mirror that silently
   deletes itself after one bad upstream deploy is worse than a mirror that goes stale loudly.
3. **Fetch** — all files, 8 at a time, with retry and backoff. Every body is checked before
   anything is written: specs must parse as JSON, and pages must not be HTML. Any file that
   fails after three attempts, or fails its check, aborts the run before any write.
4. **Write and prune** — changed files are written; files no longer listed upstream are deleted.
   Pruning happens only after the guardrail passes.
5. **Commit** — direct to `main`, only when something changed, with the summary in the commit
   message: `docs: sync 2026-09-22 (3 modified, 1 added, 0 removed)`.

Run it yourself with `node update.ts` (Node 22.18 or later, which runs TypeScript directly; Bun
works too). It has no dependencies and is idempotent.

One file listed upstream is deliberately not mirrored: a stale AsyncAPI document under
`developers-old/` that describes the *international* Polymarket WebSocket and is referenced by no
page. It is listed, with the reason, at the bottom of `INDEX.md`.

Known single point of failure: `llms.txt` is the only enumeration source used. Upstream also
publishes a `sitemap.xml`, which at the time of writing lists exactly the same pages. If
Polymarket US withdraws the `.md` endpoints, the nightly job fails visibly rather than
corrupting the mirror.

## Licence and attribution

This is an **unofficial** mirror. It is not affiliated with, endorsed by, or maintained by
Polymarket or Polymarket US.

- The documentation under `docs/` is the property of its owner, reproduced here unmodified for
  reference. All rights to that content remain with its owner.
- The tooling in this repository — `update.ts`, the workflow, and the generated index — is
  [MIT licensed](LICENSE).

Content may be stale or incomplete. **The live documentation is always authoritative**,
especially for anything involving funds, margin, collateral, or order handling. Verify against
[docs.polymarket.us](https://docs.polymarket.us/api-reference/introduction) before you trade on
it.
