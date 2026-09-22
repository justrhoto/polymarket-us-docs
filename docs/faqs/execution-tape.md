> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Time & Sales Report

> Execution tape with time, price, size, and symbol

<Card title="Download Time & Sales Reports" icon="download" href="https://www.polymarketexchange.com/time-and-sales.html">
  Access historical Time & Sales Reports on polymarketexchange.com
</Card>

The Time & Sales Report is a minimal execution tape containing exactly 4 columns. It provides a pure log of executed trades without side, aggressor flag, or buyer/seller information.

**File format:** `YYYYMMDD-time-and-sales.csv`

**Example:** `20260113-time-and-sales.csv`

## Fields

| Field                | Description                                        |
| -------------------- | -------------------------------------------------- |
| **Transaction Time** | Timestamp of the executed trade                    |
| **Symbol**           | Contract identifier                                |
| **Last Price**       | Execution price of the trade (implied probability) |
| **Last Quantity**    | Size of the trade (number of contracts)            |

## Key Characteristics

Time & Sales is a pure execution log containing only:

* Time
* Price
* Size
* Symbol

It does not include side, aggressor flag, or buyer/seller information.
