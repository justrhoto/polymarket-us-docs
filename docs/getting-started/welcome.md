> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Welcome

> Polymarket US

[Looking for Polymarket International documentation?
Visit International Docs →](https://docs.polymarket.com)

# Polymarket US ![US flag](https://mintcdn.com/polymarketusdocs/SEXtdqzXAX6KiYUU/icons/us-flag.svg?fit=max\&auto=format\&n=SEXtdqzXAX6KiYUU\&q=85\&s=662eb668d07aa4a45fd6731b88b61261) Documentation

Build on the world's largest prediction market.

## Developer Quickstart

Make your first API request in minutes. Learn the basics of the Polymarket US platform, fetch market data, place orders, and redeem winning positions.

[Get Started →](/getting-started/quickstart)

```typescript TypeScript theme={null}
import { PolymarketUS } from 'polymarket-us';

const client = new PolymarketUS({
  keyId: process.env.POLYMARKET_KEY_ID,
  secretKey: process.env.POLYMARKET_SECRET_KEY,
});

const order = await client.orders.create({
  marketSlug: 'chiefs-super-bowl-lx',
  intent: 'ORDER_INTENT_BUY_LONG',
  type: 'ORDER_TYPE_LIMIT',
  price: { value: '0.55', currency: 'USD' },
  quantity: 100,
  tif: 'TIME_IN_FORCE_GOOD_TILL_CANCEL',
});
```

```python Python theme={null}
import os
from polymarket_us import PolymarketUS

client = PolymarketUS(
    key_id=os.environ["POLYMARKET_KEY_ID"],
    secret_key=os.environ["POLYMARKET_SECRET_KEY"],
)

order = client.orders.create({
    "marketSlug": "chiefs-super-bowl-lx",
    "intent": "ORDER_INTENT_BUY_LONG",
    "type": "ORDER_TYPE_LIMIT",
    "price": {"value": "0.55", "currency": "USD"},
    "quantity": 100,
    "tif": "TIME_IN_FORCE_GOOD_TILL_CANCEL",
})
```

## Get Familiar with Polymarket US

Learn the fundamentals, explore our APIs, and start building on the world's largest prediction market.

> **[Quickstart](/getting-started/quickstart)**
>
> Set up your environment and make your first API call in minutes.

> **[Core Concepts](/concepts/events-and-markets)**
>
> Understand markets, events, and how trading works.

> **[API Reference](/api-reference/introduction)**
>
> Explore REST endpoints, WebSocket streams, and authentication.

> **[SDKs](/api-reference/sdks/introduction)**
>
> Official Python and TypeScript libraries for faster development.


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.