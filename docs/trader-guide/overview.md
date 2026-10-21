> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Trader Guide Overview

> Connect to the Polymarket Exchange for direct market access trading

## Who Is This For?

The Trader Guide is designed for:

* **Institutional traders** accessing markets directly
* **Proprietary trading firms** executing strategies programmatically
* **Market makers** providing liquidity
* **Quantitative traders** building automated trading systems

## What You Can Do

With trading access, you can:

| Action | Description | Access Method |
| - | - | - |
| **Place Orders** | Submit limit orders, market orders | REST API, gRPC |
| **Cancel Orders** | Cancel individual or bulk orders | REST API, gRPC |
| **Monitor Positions** | Track your positions and balances | REST API, gRPC Streaming |
| **Access Market Data** | Real-time quotes, order book, statistics | REST API, gRPC Streaming |
| **Query Reference Data** | Instruments, symbols, metadata | REST API |

## Key Concepts

### Environments

Polymarket Exchange provides multiple environments for testing and production:

* **Development** - Internal testing environment
* **Pre-production** - UAT environment with test funds
* **Production** - Live trading environment

> **[Environments](/trader-guide/environments)**
>
> View API endpoints and configuration

### Rate Limits

API requests are subject to rate limits to ensure fair usage:

* REST API: Request-based limits per endpoint
* gRPC: Connection and message limits

> **[Rate Limits](/trader-guide/rate-limits)**
>
> Understand rate limiting policies

### Connection Options

Choose the right protocol for your use case:

* **REST API** - Simple request/response for orders and queries
* **gRPC** - High-performance streaming for market data and order updates
* **FIX** - Industry-standard protocol for institutional trading

> **[Connection Options](/trader-guide/connection-options)**
>
> Compare connection protocols

### Schema

Strongly-typed instrument fields for safely identifying sports and crypto price markets without parsing symbols or slugs.

> **[Sports Schema](/trader-guide/sports-schema)**
>
> Identify sports markets via instrument metadata

> **[Crypto Schema](/trader-guide/crypto-schema)**
>
> Identify crypto price markets via instrument metadata


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.