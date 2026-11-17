> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Opposing Sides

> Learn how buying the other side of a market affects the position you hold

In each market, you can hold only one side at a time. If you buy the other side, that buy cashes out your current position right away. Depending on how much you buy, your position is reduced, closed, or switched to the other side.

## How It Works

1. You hold a position on one side of a market.
2. You buy the other side with a market or limit order.
3. Before the order goes out, a confirmation message in the app explains that this buy cashes out the position you hold.
4. When the order fills, the matching part of your position is cashed out and the cash goes to your balance.
5. Whatever is left is your new position. Your new position = contracts held − contracts bought on the other side (a negative result means you now hold the other side).

Buying the other side of a position you hold leads to one of three outcomes:

1. **Reduces:** You buy fewer contracts on the other side than you hold. Part of your position is cashed out, and the rest stays open.
2. **Closes:** You buy the same number of contracts on the other side as you hold. Your whole position is cashed out.
3. **Switches sides:** You buy more contracts of the other side than you hold. Your whole position is cashed out, and the rest opens a position on the other side.

This is based on the number of contracts, not the dollar amount. The cost of the other side depends on its current price.

## Examples

You hold 10 Yes contracts in a binary market (purchased at \$0.60)

**Scenario A - Position Reduces**

* **You buy 4 No contracts:** 4 of your Yes contracts are cashed out. You now hold 6 Yes contracts.
* **Math:** At \$0.25 per No, 4 × (\$1.00 − \$0.25) = \$3.00 cash out.

![Confirmation message when buying No while holding Yes](https://mintcdn.com/polymarketusdocs/tm8-3xNeoae_Y1R1/images/learn/trading/opposing-sides-reduces.png?fit=max\&auto=format\&n=tm8-3xNeoae_Y1R1\&q=85\&s=37224c45e9e24d693e6b526bdefa0149)

**Scenario B - Position Closes**

* **You buy 10 No contracts:** All 10 Yes contracts are cashed out. You no longer hold a position in this market.
* **Math:** At \$0.25 per No, 10 × (\$1.00 − \$0.25) = \$7.50 cash out.

![Confirmation message when buying No to close a Yes position](https://mintcdn.com/polymarketusdocs/tm8-3xNeoae_Y1R1/images/learn/trading/opposing-sides-closes.png?fit=max\&auto=format\&n=tm8-3xNeoae_Y1R1\&q=85\&s=973dc719929c952ce4db152a12086048)

**Scenario C - Position Switches Sides**

* **You buy 15 No contracts:** All 10 Yes contracts are cashed out, and the remaining 5 go to No. You now hold 5 No.
* **Math:** At \$0.25 per No, 10 × (\$1.00 − \$0.25) = \$7.50 cash out, and 5 × \$0.25 = \$1.25 buys your 5 No. If the market resolves No then the payout would be \$5.00.

![Confirmation message when buying No to switch from Yes to No](https://mintcdn.com/polymarketusdocs/tm8-3xNeoae_Y1R1/images/learn/trading/opposing-sides-switches.png?fit=max\&auto=format\&n=tm8-3xNeoae_Y1R1\&q=85\&s=bd8366f293539f50c9064382b594534a)


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.