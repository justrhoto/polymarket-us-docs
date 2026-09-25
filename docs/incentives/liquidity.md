> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Liquidity Incentive Program

> Earn rewards for placing resting orders close to the best price.

<div className="rewards-cta">
  <Card title="View polymarket.us/rewards" icon="magnifying-glass-dollar" href="https://polymarket.us/rewards" arrow>
    **The live rewards schedule is published at polymarket.us/rewards.** Search and filter rewards on every market — current reward pools, discount factors, target sizes, max spreads, and eligible markets, always up to date.
  </Card>
</div>

This program rewards traders for placing resting limit orders. The closer your orders are to the best price and the larger they are, the more you earn. Every second, the Exchange scores each trader's resting orders based on price and size, and rewards are split proportionally.

| Term                   | Definition                                                                                                                                                                                                                                                                                                                                                                                      |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Time Period**        | A window during the event lifecycle (e.g., pre-event, event day, mid-event) with its own reward pool                                                                                                                                                                                                                                                                                            |
| **Discount Factor**    | How much orders further from the best price are penalized; closer orders score higher                                                                                                                                                                                                                                                                                                           |
| **Target Size**        | The minimum number of contracts that must exist on each side of the book for that side to qualify for rewards                                                                                                                                                                                                                                                                                   |
| **Max Spread**         | Optional. How far each side's size-adjusted price (where the walk to Target Size lands) may sit from the midpoint for a second to pay. A 3.5¢ Max Spread is 3.5¢ from mid, so a 7¢ gap between the two sides. polymarket.us/rewards shows cents; a dash means the program has none. The API field `maxSpread` is the same value in dollars (`0.035`) and is omitted when there is no Max Spread |
| **Time Period Reward** | The total reward pool for each time period                                                                                                                                                                                                                                                                                                                                                      |

## FAQ

### How does scoring work?

Every second, a random snapshot of the order book is taken. Your score for each resting order is:

`Score = Discount Factor ^ (ticks from best price) × Order Size`

For example, with a Discount Factor of 0.30:

* 1,000 contracts at best price: 0.30^0 × 1,000 = **1,000**
* 1,000 contracts 1 tick away: 0.30^1 × 1,000 = **300**
* 1,000 contracts 2 ticks away: 0.30^2 × 1,000 = **90**
* 1,000 contracts 3 ticks away: 0.30^3 × 1,000 = **27**

If these are the only orders on this side, the trader at the best price earns 1,000 / 1,417 = **70.6%** of that snapshot's score on that side, and the trader 3 ticks away earns 27 / 1,417 = **1.9%**. Each snapshot is equally weighted; see "How are snapshots weighted?" below.

With a higher Discount Factor like 0.90 (MLB futures), the penalty is gentler: 1,000 at best price scores **1,000**, one tick away scores **900**, two ticks away scores **810**.

Each side of the book is scored independently, and the formula works the same regardless of tick size (1c or 0.1c); a "tick" is always one minimum price increment. Where a program sets a Max Spread, the book as a whole must also qualify that second — see "What is Max Spread?" below. You do not have to quote both sides yourself; once a second qualifies, a one-sided quote still earns on the side it rests on. Programs without a Max Spread score each side on its own, even if the other side is empty.

### How are snapshots weighted?

Each snapshot is normalized; the bid side and ask side are each independently normalized to 1.0 per snapshot, provided Target Size is met on that side. Where a program sets a Max Spread, both sides must reach Target Size with each size-adjusted price within the Max Spread of the midpoint, or neither side is paid. Every second of the time period is weighted equally regardless of how much liquidity is on the book. A second during halftime with 1M contracts counts the same as a second during live play with 2K contracts, so long as that second qualifies. A second that fails the Max Spread check still counts toward the time period, so its share of the pool is forfeited rather than redistributed.

### How does Target Size work?

Target Size is the minimum aggregate size of resting orders (across all participants) needed on a side of the book for that side to qualify. It uses raw size, not discounted size. The exchange walks from the best price outward, accumulating orders until Target Size is reached. All orders within that range score; orders beyond it do not.

If Target Size is reached before your price level, your order will not score, regardless of how close it is to the best price. For example, if Target Size is 20,000 and there are 25,000 contracts resting at the best price, orders at the second-best price receive zero score.

Target Size isn't a per-person cap. Once the threshold is met, all qualifying orders score proportionally. Bigger orders earn more. There's no ceiling on how much size you can have scored.

The price at which the walk reaches Target Size is that side's size-adjusted price. A Max Spread is measured from the midpoint of the two size-adjusted prices, not from the best bid and offer. A small order at the best price does not set that price on its own.

### What is Max Spread?

Max Spread is an optional per-program parameter that requires two-sided liquidity near the midpoint. It is a test of the book, not of each trader: you do not have to quote both sides yourself. Where a program sets one, every second the exchange walks both sides of the book to Target Size, takes each side's size-adjusted price, and computes the midpoint between them. If either size-adjusted price sits more than the Max Spread from that midpoint (equivalently, if the two size-adjusted prices are more than twice the Max Spread apart), nobody is paid for that second. If either side never reaches Target Size, there is no midpoint and the second is forfeited as well — including a side that did reach Target Size.

For example, with a Max Spread of 3.5¢ (so the two size-adjusted prices may be up to 7¢ apart) and a Target Size of 1,000: if bids reach 1,000 contracts by 49¢ and asks reach 1,000 contracts by 51¢, the midpoint is 50¢ and each side sits 1¢ from it, so the second pays and is split as usual. If the asks only reach 1,000 contracts by 57¢, the midpoint is 53¢ and each side sits 4¢ from it — more than 3.5¢ — so nobody is paid for that second. Sitting exactly on the limit still pays: bids by 47¢ and asks by 54¢ put the midpoint at 50.5¢ and each side exactly 3.5¢ from it (a 7¢ gap).

* Max Spread is a price distance, not a number of ticks, so 3.5¢ means the same on a 1c and a 0.1c market. This page and [polymarket.us/rewards](https://polymarket.us/rewards) show cents; the [incentives API](/api-reference/incentives/overview) returns the same value as `timePeriods[].maxSpread` in dollars (`0.035` = 3.5¢), omitted when a program has no Max Spread. A program with no Max Spread shows a dash on the rewards page.
* Forfeited seconds still count toward the time period and are not redistributed.
* Programs without a Max Spread score each side on its own, so a side that reaches Target Size still pays even if the other side does not.

### Can size compensate for the Discount Factor?

Yes; a larger order further from the best price can still earn meaningful rewards. However, the discount compounds with each tick, so orders closer to the best price are significantly more capital-efficient. For example, with a Discount Factor of 0.30, an order one tick away needs roughly 3× the size to earn the same score as an order at the best price.

### Can the parameters change?

Yes. Target Size, Discount Factor, Max Spread, and Time Period Reward may be adjusted between time periods as liquidity conditions change. The current schedule for every market is published live at [polymarket.us/rewards](https://polymarket.us/rewards).

### Is there a cap on how much one person can earn?

No. Your payout is purely proportional to your share of the total score. If you're the only one providing liquidity on a second that qualifies, you earn that second's full share of the pool. Seconds that fail a Max Spread check still count toward the period and pay nobody.

### When are rewards paid out?

Rewards are calculated within 5 business days of each time period ending and credited to your account within 2 business days of the end of that calculation.

### What do the time periods mean?

* **Early / Pre-game (pre-day):** From market listing until 6 hours before the event
* **Day-of / Pre-game:** From 6 hours before until the event starts
* **Live:** From event start until settlement
* **Daily (per event):** A per-day pool on an event without a fixed start (e.g. futures), running midnight to midnight Eastern Time (ET)

### Is there a minimum payout?

Yes. Rewards under \$1.00 are not paid out.

### What about canceled or postponed games?

No rewards are distributed for canceled or postponed games.
