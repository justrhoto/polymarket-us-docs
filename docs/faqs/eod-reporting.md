> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Daily Market Report

> EOD contract summary

<Card title="Download Daily Market Reports" icon="download" href="https://www.polymarketexchange.com/daily-market-report.html">
  Access historical Daily Market Reports on polymarketexchange.com
</Card>

The Daily Market Report is an EOD contract summary containing 21 columns. It includes volume decomposition, price ranges, open interest, and settlement prices.

**File format:** `YYYYMMDD-daily-market-report.csv`

**Example:** `20260112-daily-market-report.csv`

## Fields

| Field                            | Description                                           |
| -------------------------------- | ----------------------------------------------------- |
| **Report ID**                    | Internal identifier for the report row                |
| **Business Date**                | Trading date the data applies to                      |
| **Symbol**                       | Contract identifier                                   |
| **Maturity Date**                | Contract expiration date                              |
| **Maturity Time**                | Contract expiration time                              |
| **Strike Price**                 | Strike (used for option-style or threshold contracts) |
| **Description**                  | Human-readable contract description                   |
| **Open Interest**                | Outstanding open contracts                            |
| **Trade Volume**                 | Total traded volume for the day                       |
| **Block Volume**                 | Volume from block trades                              |
| **Exchange for Physical Volume** | EFP volume (physical-style settlement)                |
| **Exchange for Risk Volume**     | EFR volume (risk transfer trades)                     |
| **Threshold Volume**             | Volume attributed to threshold-style trades           |
| **Other Volume**                 | Residual volume not classified above                  |
| **Low Bid Price**                | Lowest bid observed during the day                    |
| **High Bid Price**               | Highest bid observed during the day                   |
| **Low Offer Price**              | Lowest offer observed during the day                  |
| **High Offer Price**             | Highest offer observed during the day                 |
| **Low Trade Price**              | Lowest execution price of the day                     |
| **High Trade Price**             | Highest execution price of the day                    |
| **Settlement Price**             | Official settlement price                             |

## Key Characteristics

The Daily Market Report is a comprehensive EOD contract summary containing:

* Volume decomposition by trade type (Block, EFP, EFR, Threshold, Other)
* Price ranges (bid, offer, trade)
* Open interest
* Settlement price
