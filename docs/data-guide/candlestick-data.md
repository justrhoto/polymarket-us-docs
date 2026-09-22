> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Candlestick Data

> Generate candlestick data for market analysis and charting

## Overview

Polymarket Exchange provides multiple methods for obtaining candlestick (OHLC - Open, High, Low, Close) data for market analysis and charting applications.

## Method 1: Pre-Aggregated Statistics (Recommended)

Use the REST API's trade statistics endpoint to get pre-calculated OHLC data:

```bash theme={null}
POST /v1beta1/report/trades/stats
```

**Request Example:**

```json theme={null}
{
  "symbol": "aec-nfl-buf-kc-2026-01-26",
  "start_time": "2026-01-25T00:00:00Z",
  "end_time": "2026-01-26T23:59:59Z",
  "interval": "1h"
}
```

**Response Example:**

```json theme={null}
{
  "stats": [
    {
      "interval_start": "2026-01-25T00:00:00Z",
      "interval_end": "2026-01-25T01:00:00Z",
      "open": "550",
      "high": "580",
      "low": "545",
      "close": "575",
      "volume": "15000",
      "notional": "8625000"
    }
  ]
}
```

**Benefits:**

* Server-side aggregation (faster, more efficient)
* Ready-to-use candlestick data
* Configurable time intervals
* No client-side computation required

**Common Intervals:**

* `1m` - 1 minute
* `5m` - 5 minutes
* `15m` - 15 minutes
* `1h` - 1 hour
* `4h` - 4 hours
* `1d` - 1 day

## Method 2: Manual Aggregation from Trade Data

Query individual trades and calculate OHLC values client-side:

```bash theme={null}
POST /v1beta1/report/trades/search
```

**Request Example:**

```json theme={null}
{
  "symbol": "aec-nfl-buf-kc-2026-01-26",
  "start_time": "2026-01-25T00:00:00Z",
  "end_time": "2026-01-26T23:59:59Z",
  "limit": 1000
}
```

**Response Example:**

```json theme={null}
{
  "trades": [
    {
      "trade_id": "12345",
      "symbol": "aec-nfl-buf-kc-2026-01-26",
      "price": "550",
      "quantity": "100",
      "timestamp": "2026-01-25T00:05:32Z"
    },
    {
      "trade_id": "12346",
      "symbol": "aec-nfl-buf-kc-2026-01-26",
      "price": "560",
      "quantity": "200",
      "timestamp": "2026-01-25T00:12:18Z"
    }
  ]
}
```

### Aggregation Logic

1. Query trades for the desired time range
2. Group trades by your chosen interval (e.g., 5min, 1h, 1d)
3. For each interval, calculate:

| Metric       | Calculation                              |
| ------------ | ---------------------------------------- |
| **Open**     | First trade price in the interval        |
| **High**     | Maximum trade price in the interval      |
| **Low**      | Minimum trade price in the interval      |
| **Close**    | Last trade price in the interval         |
| **Volume**   | Sum of quantities traded in the interval |
| **Notional** | Sum of (price × quantity) for all trades |

### Python Example

```python theme={null}
from datetime import datetime, timedelta
import requests

def aggregate_candles(trades, interval_minutes=5):
    """
    Aggregate trades into OHLC candles.

    Args:
        trades: List of trade dicts with 'timestamp', 'price', 'quantity'
        interval_minutes: Candle interval in minutes

    Returns:
        List of OHLC candle dicts
    """
    candles = {}

    for trade in trades:
        # Round timestamp down to interval
        ts = datetime.fromisoformat(trade['timestamp'].replace('Z', '+00:00'))
        interval_start = ts.replace(
            minute=(ts.minute // interval_minutes) * interval_minutes,
            second=0,
            microsecond=0
        )

        key = interval_start.isoformat()

        if key not in candles:
            candles[key] = {
                'open': float(trade['price']),
                'high': float(trade['price']),
                'low': float(trade['price']),
                'close': float(trade['price']),
                'volume': 0,
                'notional': 0
            }

        # Update candle
        candle = candles[key]
        price = float(trade['price'])
        qty = float(trade['quantity'])

        candle['high'] = max(candle['high'], price)
        candle['low'] = min(candle['low'], price)
        candle['close'] = price  # Last trade price
        candle['volume'] += qty
        candle['notional'] += price * qty

    return [{'timestamp': k, **v} for k, v in sorted(candles.items())]

# Usage
trades = get_trades(symbol="aec-nfl-buf-kc-2026-01-26")
candles_5m = aggregate_candles(trades, interval_minutes=5)
```

**When to use:**

* Custom aggregation logic needed
* Non-standard time intervals
* Additional trade metadata required
* Complex filtering or weighting logic

## Method 3: Real-Time Streaming

Subscribe to market data via gRPC to build live candlestick charts that update as trades occur.

### Subscribe to Market Data

```python theme={null}
import grpc
from polymarket_pb2 import MarketDataRequest
from polymarket_pb2_grpc import MarketDataServiceStub

# Create channel with credentials
channel = grpc.secure_channel(
    'grpc.preprod.polymarketexchange.com:443',
    grpc.ssl_channel_credentials()
)

stub = MarketDataServiceStub(channel)

# Subscribe to symbols
request = MarketDataRequest(
    symbols=["aec-nfl-buf-kc-2026-01-26"]
)

# Stream updates
for update in stub.Subscribe(request, metadata=[('authorization', f'Bearer {token}')]):
    # Extract last trade price and volume
    last_price = update.last_px
    last_volume = update.last_qty
    timestamp = update.transact_time

    # Update your current candlestick
    update_candlestick(last_price, last_volume, timestamp)
```

### Building Real-Time Candles

```python theme={null}
from datetime import datetime, timedelta

class RealtimeCandleBuilder:
    def __init__(self, interval_seconds=60):
        self.interval_seconds = interval_seconds
        self.current_candle = None
        self.candles = []

    def on_trade(self, price, volume, timestamp):
        """Process incoming trade from stream"""
        interval_start = self._get_interval_start(timestamp)

        # Start new candle if needed
        if self.current_candle is None or self.current_candle['start'] != interval_start:
            if self.current_candle:
                self.candles.append(self.current_candle)

            self.current_candle = {
                'start': interval_start,
                'open': price,
                'high': price,
                'low': price,
                'close': price,
                'volume': 0
            }

        # Update current candle
        self.current_candle['high'] = max(self.current_candle['high'], price)
        self.current_candle['low'] = min(self.current_candle['low'], price)
        self.current_candle['close'] = price
        self.current_candle['volume'] += volume

    def _get_interval_start(self, timestamp):
        """Round timestamp down to interval"""
        ts = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
        seconds_since_epoch = int(ts.timestamp())
        interval_start = (seconds_since_epoch // self.interval_seconds) * self.interval_seconds
        return datetime.fromtimestamp(interval_start)

# Usage
builder = RealtimeCandleBuilder(interval_seconds=300)  # 5-minute candles

for market_update in stream:
    builder.on_trade(
        price=market_update.last_px,
        volume=market_update.last_qty,
        timestamp=market_update.transact_time
    )

    # Get current candle for display
    current = builder.current_candle
```

**Features:**

* Real-time price updates
* Last trade price and volume
* Aggregated statistics (cumulative volume, notional traded)
* Best bid/offer data

**Use cases:**

* Live trading dashboards
* Real-time candlestick charts
* Automated trading strategies
* Market monitoring systems

## Choosing the Right Method

| Method                  | Best For                                | Latency   | Complexity |
| ----------------------- | --------------------------------------- | --------- | ---------- |
| **Pre-Aggregated**      | Historical analysis, standard intervals | Low       | Low        |
| **Manual Aggregation**  | Custom intervals, special calculations  | Medium    | Medium     |
| **Real-Time Streaming** | Live charts, automated trading          | Real-time | High       |

## Best Practices

### Time Zones

All timestamps are in UTC. Ensure your client handles timezone conversion appropriately:

```python theme={null}
from datetime import datetime
import pytz

# Convert UTC to local time
utc_time = datetime.fromisoformat('2026-01-25T00:00:00Z'.replace('Z', '+00:00'))
local_time = utc_time.astimezone(pytz.timezone('America/New_York'))
```

### Price Scaling

Prices in the API use a `price_scale` multiplier. Check the instrument's reference data:

```python theme={null}
# If price_scale = 1000, then price "550" represents $0.55
actual_price = int(price) / price_scale
```

### Data Gaps

Handle gaps in data gracefully:

* Pre-aggregated: Missing intervals indicate no trades occurred
* Manual: Empty intervals should show previous close as O/H/L/C
* Streaming: Implement reconnection logic for dropped connections

### Caching

For historical data:

* Cache pre-aggregated candles locally
* Only query new intervals since last update
* Use `start_time` filters to avoid redundant data
