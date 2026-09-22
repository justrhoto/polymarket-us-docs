> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Rate Limits

> API rate limits and best practices for integration

The Polymarket US API enforces rate limits to ensure fair usage and system stability. All limits are **per participant firm** unless stated otherwise.

## Institutional Order Entry

REST and unary gRPC order-entry requests use tiered rate limits. Institutional order entry and FIX use the same firm tier.

Each method has its own per-firm rate-limit bucket. Methods displaying the same limit do not share that allowance.

| Method                   |     Tier 1 |      Tier 2 |      Tier 3 |        Tier 4 | Maximum operations per request |
| ------------------------ | ---------: | ----------: | ----------: | ------------: | -----------------------------: |
| `InsertOrder`            | 30 req/sec | 100 req/sec | 200 req/sec |   400 req/sec |                        1 order |
| `CancelReplaceOrder`     | 30 req/sec | 100 req/sec | 200 req/sec |   400 req/sec |                  1 replacement |
| `CancelOrder`            | 90 req/sec | 300 req/sec | 600 req/sec | 1,200 req/sec |                       1 cancel |
| `InsertOrderList`        | 50 req/sec |  50 req/sec |  50 req/sec |    50 req/sec |                      20 orders |
| `CancelOrderList`        | 50 req/sec |  50 req/sec |  50 req/sec |    50 req/sec |                     20 cancels |
| `CancelReplaceOrderList` | 50 req/sec |  50 req/sec |  50 req/sec |    50 req/sec |                20 replacements |

REST and unary gRPC tiers are determined by your [contract volume share on Polymarket US](#volume-share-and-tier-requirements). Batch order method limits remain flat across all tiers.

Each bucket's capacity equals the published per-second rate and replenishes continuously at that rate. These limits are not averaged over a 1-minute window.

Each batch order request counts once toward that method's rate limit, regardless of the number of operations in the request.

## FIX Protocol

FIX rate limiting is enforced at the FIX gateway level. Rate limits are determined by tier.

| Tier   | Rate limit              |
| ------ | ----------------------- |
| Tier 1 | 35 msg/sec per session  |
| Tier 2 | 150 msg/sec per session |
| Tier 3 | 300 msg/sec per session |
| Tier 4 | 500 msg/sec per session |

Tiers are determined by your [contract volume share on Polymarket US](#volume-share-and-tier-requirements).

## Volume Share and Tier Requirements

Each day, Polymarket US sums the contracts you traded over the trailing 30 days and divides that by the total contracts traded across the exchange over the same period. This number is your volume share. Each filled contract counts once, regardless of its execution price or the number of combo legs.

Once you meet the Earn volume share for a given tier, you are automatically eligible for the tier's rate limit.

You must keep at least the Maintain volume share to stay eligible for your current tier. If you drop below the Maintain volume share, your rate limit will not drop immediately. You will have 30 days to get back above the Maintain volume share before being moved to a lower tier.

Each tier has its own Earn and Maintain volume share requirement, seen below.

| Tier   | Earn   | Maintain |
| ------ | ------ | -------- |
| Tier 1 | N/A    | N/A      |
| Tier 2 | 0.125% | 0.10%    |
| Tier 3 | 0.50%  | 0.225%   |
| Tier 4 | 1.50%  | 1.20%    |

**Accelerated Tier Placement:** A Participant may provide verifiable proof of their trailing-30-day contract trading volume on another prediction market venue and be assigned to the tier corresponding to that volume.

## REST API

### Query / Report Endpoints

These read-heavy endpoints have separate per-firm limits. Cache responses where noted.

| Endpoint           | Limit      | Notes                               |
| ------------------ | ---------- | ----------------------------------- |
| `GetTradeStats`    | 60 req/min | Heavy aggregation query             |
| `ListInstruments`  | 6 req/min  | Static data - cache client-side     |
| `ListSymbols`      | 6 req/min  | Static data - cache client-side     |
| `GetOrderBook`     | 12 req/min | Prefer streaming for real-time data |
| `GetBBO`           | 12 req/min | Prefer streaming for real-time data |
| `SearchOrders`     | 12 req/min | Use filters to narrow results       |
| `SearchExecutions` | 12 req/min | Use filters to narrow results       |
| `SearchTrades`     | 12 req/min | Use filters to narrow results       |

### Combos Endpoints

Combos endpoints have these per-firm limits:

| Endpoint      | Limit       | Notes                                |
| ------------- | ----------- | ------------------------------------ |
| `GetCombos`   | 100 req/sec | Exact combo lookup                   |
| `CreateCombo` | 1 req/sec   | Create or retrieve a canonical combo |

### Public (Unauthenticated) Endpoints

| Limit                   | Value     |
| ----------------------- | --------- |
| Max requests per second | 20 per IP |

## gRPC Streaming

Unary gRPC order-entry calls use the [Institutional Order Entry](#institutional-order-entry) limits above. The limits in this section apply to streaming connections.

| Setting                                             | Value       |
| --------------------------------------------------- | ----------- |
| Max concurrent streams per firm                     | 20          |
| Ingress message rate (per firm, across all streams) | 100 msg/sec |
| `StreamRFQEvents` new stream opens per firm         | 1/sec       |
| Egress (server to client)                           | Unlimited   |

Ingress rate is averaged over a 1-minute window, allowing short bursts. Exceeding the average limit will result in throttled or rejected messages. This limit applies to all participants.

The `StreamRFQEvents` limit is checked only when opening a stream. It does not limit server-pushed RFQ or quote events on an established stream.

## RFQ Endpoints

The institutional `polymarket.v1.RFQAPI` endpoints have these per-firm limits, shared across REST and unary gRPC requests:

| Endpoint       | Limit             | Notes                                           |
| -------------- | ----------------- | ----------------------------------------------- |
| `GetRFQUserID` | 1 req/sec         | RFQ user ID lookup                              |
| `GetRFQs`      | 10 req/sec        | Prefer `StreamRFQEvents` for live RFQ changes   |
| `GetQuotes`    | 10 req/sec        | Prefer `StreamRFQEvents` for live quote changes |
| `CreateRFQ`    | 1 req/sec         | RFQ creation                                    |
| `DeleteRFQ`    | 100 req/sec       | Close an open RFQ                               |
| `CreateQuote`  | 400–2,000 req/sec | Quote creation; determined by RFQ tier          |
| `DeleteQuote`  | 400–2,000 req/sec | Quote deletion; determined by RFQ tier          |
| `AcceptQuote`  | 100 req/sec       | Quote acceptance                                |
| `ConfirmQuote` | 100 req/sec       | Last-look quote confirmation                    |

Each row above has a separate per-firm endpoint bucket with one second of burst capacity. Traffic to one method does not consume another method's endpoint-specific allowance. Exchange-wide limits also apply.

### RFQ Rate-Limit Tiers

Your RFQ tier determines your `CreateQuote` and `DeleteQuote` limits. Each method has its own allowance:

| Tier   | `CreateQuote` | `DeleteQuote` |
| ------ | ------------- | ------------- |
| Tier 1 | 400 req/sec   | 400 req/sec   |
| Tier 2 | 600 req/sec   | 600 req/sec   |
| Tier 3 | 800 req/sec   | 800 req/sec   |
| Tier 4 | 2,000 req/sec | 2,000 req/sec |

### RFQ Volume Share and Tier Requirements

Your RFQ volume share is your RFQ-originated maker contracts over the trailing 30 days divided by the total RFQ-originated maker contracts across all firms, including retail participants, over the same period. A fill counts when its passive (maker) order originated from an RFQ. Each filled contract counts once, regardless of its price or the number of combo legs.

Once you meet the Earn volume share for a given tier, you are eligible for that tier's RFQ rate limits.

You must keep at least the Maintain volume share to stay eligible for your current tier. Maintain is 80% of Earn. If you drop below the Maintain volume share, your rate limit will not drop immediately. You will have 30 days to get back to at least the Maintain volume share before being moved to a lower tier.

| Tier   | Earn | Maintain |
| ------ | ---- | -------- |
| Tier 1 | N/A  | N/A      |
| Tier 2 | 0.5% | 0.4%     |
| Tier 3 | 1%   | 0.8%     |
| Tier 4 | 5%   | 4%       |

RFQ tiers use a separate volume measure and eligibility thresholds from the institutional order-entry (REST and unary gRPC) and FIX tiers above.

## Summary

| Protocol                                                         | Scope                  | Limit                                       |
| ---------------------------------------------------------------- | ---------------------- | ------------------------------------------- |
| Institutional API - orders (`InsertOrder`, `CancelReplaceOrder`) | Per firm, per method   | 30–400 req/sec by tier                      |
| Institutional API - cancels (`CancelOrder`)                      | Per firm, per method   | 90–1,200 req/sec by tier                    |
| Institutional API - batch order methods                          | Per firm, per method   | 50 req/sec; up to 20 operations per request |
| REST - query endpoints                                           | Per firm, per endpoint | 0.5–60 req/min (see table above)            |
| REST - combos endpoints                                          | Per firm, per endpoint | 1–100 req/sec (see table above)             |
| REST - public/unauth                                             | Per IP                 | 20 req/sec                                  |
| gRPC - `StreamRFQEvents` opens                                   | Per firm               | 1 new stream/sec                            |
| gRPC streaming (ingress)                                         | Per firm (all streams) | 100 msg/sec (1-min avg)                     |
| gRPC streaming (egress)                                          | Per firm               | Unlimited                                   |
| RFQ - REST and unary gRPC endpoints                              | Per firm, per endpoint | 1–2,000 req/sec (see tables above)          |
| FIX                                                              | Per session            | 35–500 msg/sec by tier (see table above)    |

## Rate Limit Response

When rate limited, the REST API returns:

```json theme={null}
{
  "code": 8,
  "message": "rate limit exceeded",
  "details": []
}
```

**HTTP Status:** `429 Too Many Requests`

### Retry Strategy

When receiving a 429 response:

1. Stop making requests immediately
2. Wait 1 second before retrying
3. Implement exponential backoff for repeated 429s
4. Consider reducing your request rate

```python theme={null}
import time

def make_request_with_retry(url, headers, max_retries=3):
    for attempt in range(max_retries):
        response = requests.get(url, headers=headers)

        if response.status_code == 429:
            wait_time = 2 ** attempt  # 1, 2, 4 seconds
            print(f"Rate limited. Waiting {wait_time}s...")
            time.sleep(wait_time)
            continue

        return response

    raise Exception("Max retries exceeded")
```

## Latency Stopgap on Orders

During periods of increased latency, Polymarket US applies a **5-second stopgap** to inbound orders. If an order has been received by Polymarket US but has not been processed within 5 seconds, we reject it to protect you from a bad fill at a stale price.

<Warning>
  These rejects carry the message **`Global Rate Limit Exceeded`**, but they are **not** an actual rate limit. You do **not** need to throttle your traffic in response to them. Treat them as a transient latency reject, not a signal to back off.
</Warning>

What it applies to:

* **New orders** — rejected if not processed within 5 seconds.
* **Order modifications via cancel/replace** — also subject to the stopgap.
* **Pure cancels are not affected** — a standalone cancel is never rejected by this stopgap.

You can always cancel an order before you have received an acknowledgement, and even before it has been processed.

## Best Practices

### Use Streaming Instead of Polling

The API is designed as a **streaming-first** system. Instead of repeatedly polling for updates, subscribe to real-time streams:

| Don't Poll                                        | Use Streaming Instead                      |
| ------------------------------------------------- | ------------------------------------------ |
| Repeated calls to `/v1/report/orders/search`      | `CreateOrderSubscription` gRPC stream      |
| Repeated calls to `/v1/rfqs` or `/v1/rfqs/quotes` | `StreamRFQEvents` gRPC stream              |
| Repeated calls to `/v1/positions`                 | `CreatePositionSubscription` gRPC stream   |
| Repeated calls to `/v1/orderbook`                 | `CreateMarketDataSubscription` gRPC stream |

<Info>
  Streaming connections don't count against the REST rate limit. One streaming connection can replace hundreds of polling requests. New `StreamRFQEvents` connections are limited to one open attempt per second per firm, so reconnect with backoff.
</Info>

### Cache Reference Data

Reference data (instruments, symbols, metadata) changes infrequently - `ListInstruments` and `ListSymbols` are limited to just 6 req/min. Cache responses locally:

```python theme={null}
class InstrumentCache:
    def __init__(self):
        self.instruments = {}
        self.last_refresh = None

    def get_instrument(self, symbol):
        # Refresh cache every 5 minutes
        if self._needs_refresh():
            self._refresh_instruments()
        return self.instruments.get(symbol)

    def _needs_refresh(self):
        if not self.last_refresh:
            return True
        return (time.time() - self.last_refresh) > 300

    def _refresh_instruments(self):
        response = api.list_instruments()
        for inst in response.instruments:
            self.instruments[inst.symbol] = inst
        self.last_refresh = time.time()
```

### Batch Operations

Where possible, batch your operations instead of making individual requests:

* Use `SearchOrders` with filters instead of fetching orders one by one
* Use `ListInstruments` with symbol filters instead of individual lookups
* Subscribe to multiple symbols in a single streaming connection

## Monitoring Your Usage

Track your request patterns to stay within limits:

```python theme={null}
import time
from collections import deque

class RateLimiter:
    def __init__(self, max_requests=100, window_seconds=1):
        self.max_requests = max_requests
        self.window = window_seconds
        self.requests = deque()

    def can_make_request(self):
        now = time.time()
        # Remove old requests outside the window
        while self.requests and self.requests[0] < now - self.window:
            self.requests.popleft()
        return len(self.requests) < self.max_requests

    def record_request(self):
        self.requests.append(time.time())

    def wait_if_needed(self):
        while not self.can_make_request():
            time.sleep(0.05)  # 50ms
        self.record_request()
```

## Abuse Prevention

Patterns that may result in temporary or permanent restrictions:

* Sustained requests above the rate limit
* Polling for data available via streaming
* Requesting the same unchanged data repeatedly
* Automated retry loops without backoff

<Warning>
  Abuse of the API may result in temporary or permanent restrictions on your API credentials. Contact [onboarding@polymarket.us](mailto:onboarding@polymarket.us) if you need higher limits for legitimate use cases.
</Warning>

## Troubleshooting Rate Limits

### Consistently Hitting Limits

If you're consistently receiving 429 errors:

* Reduce request frequency
* Batch multiple operations where possible
* Cache responses that don't change frequently (reference data, instrument lists)
* Use streaming endpoints instead of polling
* Contact support to discuss higher rate limits for production use

### Need Higher Limits

For production use cases requiring higher limits:

1. Document your use case and expected volume
2. Contact support at [onboarding@polymarket.us](mailto:onboarding@polymarket.us)
3. Provide environment (dev, preprod, prod)
4. Specify which endpoints you need higher limits for

## Next Steps

<CardGroup cols={2}>
  <Card title="gRPC Streaming" icon="bolt" href="/streaming-endpoints/grpc-overview">
    Replace polling with real-time streams
  </Card>

  <Card title="Authentication" icon="key" href="/trader-guide/authentication-troubleshooting">
    Set up API authentication
  </Card>
</CardGroup>
