> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Unsubscribing from Market Data

Participants can unsubscribe from a piece of market data by entering a second MarketDataRequest \[V] message, referencing the original MDReqID (262) reference and setting SubscriptionRequestType (263) = 2 (unsubscribe).

Note that there is no explicit response to requests to unsubscribe from the Polymarket US; a successful unsubscription will simply prevent further MarketDataIncrementalRefresh \[X] messages.

## Figure 15: Successful market data subscription and unsubscription

![](https://files.readme.io/9b2dd8d-unsubscribe.png)
