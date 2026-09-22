> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Order Types

> Learn how marketable limit orders execute and how fills work

On Polymarket US, all orders are processed as **marketable limit orders**.

## How It Works

1. When you place an order, it executes at the best available price shown on the screen.
2. If enough size is available at that price, your entire order is filled.
3. If there isn't enough size, you receive a **partial fill**.
4. The unfilled portion stays on the order book as an **open order** until it is filled or canceled.

Execution is always based on available liquidity and standard time-and-price priority within the central limit order book (CLOB).

## Example

You buy 1,000 Yes contracts when the best ask is \$0.52:

* If at least 1,000 contracts are available at \$0.52 or better, the entire order is filled immediately.
* If only 600 contracts are available at \$0.52, you receive a partial fill for 600 contracts.
* The remaining 400 stay on the order book at \$0.52 as an open order until they are filled or canceled.
* Your execution price reflects only the portion that filled.

## Key Points

* **Price protection**: Your order will never be filled at a worse price than the one you set.
* **Partial fills**: Only available size is filled. Any remaining portion stays on the book as an open order.
* **Dynamic markets**: Prices and available size may change while your order is being filled, but it will only be filled at your set price.
* **Priority**: Orders match using standard time-and-price priority within the CLOB.
* **Compliance**: All orders are handled in accordance with applicable law and Polymarket US platform rules to ensure fair and orderly trading.
