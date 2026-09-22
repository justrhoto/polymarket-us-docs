> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Mass Quote Protection

Mass Quote Protection (MQP) is a risk control that automatically cancels an account's remaining eligible resting orders when that account trades too much quantity within a short, rolling time window.

MQP is intended to limit the impact of runaway quoting or unexpected market conditions by quickly removing outstanding liquidity once an execution threshold is reached.

## Triggers

MQP is configured per account with two parameters:

* **Interval (Y)**: duration of the rolling time window (e.g., 3s)
* **Traded Quantity (X)**: quantity that may be executed within the interval before MQP triggers (e.g., 10)

MQP triggers when the sum of executed quantity for a bucket within a rolling interval Y reaches or exceeds the traded quantity threshold X.

## Rolling Interval Semantics

The interval is rolling, not fixed to wall-clock boundaries. At any moment, the system considers executions in the trailing Y seconds when computing the bucket's traded quantity.

As a result:

* Executions separated by more than Y seconds do not accumulate toward the same trigger
* Executions clustered within Y seconds do accumulate

## Bucketing and Scope

MQP tracking is done per bucket, where a bucket is defined as:

```
(account, clOrdLinkId)
```

Orders are associated to a bucket using the order's `clord_link_id` value. Orders submitted without a `clord_link_id` (blank / missing) are still subject to MQP. They are tracked in their own bucket:

```
(account, "")
```

## What MQP Cancels

When MQP triggers for a given bucket, the matching engine cancels all remaining eligible resting orders in that same bucket:

* Same account
* Same `clord_link_id` (or blank bucket)
* Regardless of instrument
* Regardless of side (buy/sell)

Orders in other buckets are not affected, including:

* Same account but different `clord_link_id`
* Same `clord_link_id` but different account

## Execution and Cancel Timing

MQP is applied as part of the matching process:

1. The execution that causes the bucket's traded quantity to reach or exceed the threshold is processed normally.
2. Once MQP triggers, the matching engine cancels remaining eligible resting orders in that bucket.

MQP does not prevent an aggressing order from matching against all eligible resting orders it can reach during that matching event. This means the traded quantity may exceed the configured threshold during a single aggressing order's sweep.

## Reset Behavior

After MQP triggers and cancels orders in a bucket, the bucket's rolling interval tracking is reset immediately. The account may reuse the same `clord_link_id` and continue trading without automatic cancellation unless and until the threshold is reached again in a new interval.
