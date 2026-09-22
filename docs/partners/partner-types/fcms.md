> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# FCMs

> Guide for Futures Commission Merchant integrations

## Overview

<Card title="FCM Participant and Clearing Member Agreement" icon="file-contract" href="https://drive.google.com/uc?export=download&id=1-F_KrpgofMrS-OqcBmV_hw5iaN9GUqZR">
  Download the FCM Participant and Clearing Member Agreement for Polymarket Exchange and Polymarket Clearing
</Card>

Polymarket US partners with licensed Futures Commission Merchants (FCMs) to provide customers access to prediction markets on our platform; it maintains comprehensive compliance and operational standards for them to that end. All FCM records must be maintained for the periods specified by CFTC regulations and be readily accessible for examination. To learn more about becoming an FCM with Polymarket US, please contact **[institutional@polymarket.us](mailto:institutional@polymarket.us)**

## Requirements

To become an FCM with Polymarket US, you must:

* Be a U.S.-based entity in good standing
* Maintain all required regulatory registrations and licenses
* Comply with CFTC regulations and Polymarket US Rules
* Ensure adequate capital and financial resources
* Implement and maintain comprehensive supervisory procedures
* Designate qualified supervisory personnel
* Establish written supervisory procedures and conduct regular reviews of trading activity
* Train staff on compliance requirements

FCMs must provide their customers with:

* Account opening services including identity verification and eligibility assessment
* Collection of required documentation and disclosures
* Assessment of appropriateness of prediction market trading for each customer
* Accurate account records and ongoing oversight
* Monitoring of customer trading activity to identify and investigate unusual patterns
* Adequate systems for account surveillance
* Prompt responses to customer inquiries and concerns

FCMs are also required to:

* Implement credit and position limits for each customer account
* Validate orders against account limits before submission and reject orders that exceed established thresholds
* Maintain audit trails of all order decisions
* Route orders promptly and efficiently, providing best execution reasonably available
* Monitor order flow for conflicts of interest and document order handling procedures
* Assign unique credentials to authorized personnel only and limit API access to approved individuals
* Monitor and log all system access, immediately revoking credentials upon termination or role change
* Conduct periodic access reviews
* Clearly identify and segregate FCM principal trading accounts (proprietary) from customer accounts
* Subject proprietary accounts to enhanced monitoring
* Establish policies governing employee personal trading with pre-clearance requirements
* Restrict trading ahead of customer orders and require disclosure of personal positions that may create conflicts
* Accept responsibility for all activity under their credentials
* Promptly report any unauthorized access or suspicious activity
* Maintain adequate insurance and financial resources
* Accept liability for errors or misconduct by associated persons
* Provide timely reports to Polymarket US including large trader position reports, suspicious activity reports, material changes to registration or financial condition, and system outages or operational disruptions
* Maintain comprehensive records of all customer orders and executions, account documentation and correspondence, supervisory reviews and exception reports, system access logs, and risk limit changes and overrides

Approved FCMs receive:

* Access to Polymarket US platform for managing customer and proprietary accounts
* Support for individual retail accounts, institutional accounts, and managed accounts (with proper authorization)
* Ability to maintain separate customer accounts and proprietary accounts
* API access for trading and account management
* Rights to intermediate customer transactions

FCM customers must:

* Adhere to both FCM procedures and Polymarket US rules
* Provide all required documentation during account opening
* Maintain accurate account information
* Follow all position limits across all accounts
* Use properly segregated customer accounts (separate from FCM proprietary trading)

## Connectivity

FCMs connect to Polymarket US over a secure, private connection using VPC-peering. Once connectivity is established, you'll receive API endpoints for order entry and market data.

We support multiple protocols:

* **FIX API** - Industry-standard for order entry and execution
* **gRPC** - High-performance streaming for real-time data
* **REST API** - HTTP-based interface for trading and account management

## Funding

* **Deposits**: Funds wired to the custodian are available for trading the next business day
* **Withdrawals**: Withdrawal requests can be automatically approved or require administrator approval depending on commercial terms

## Account Structure

FCMs are set up as Clearing Members and can manage multiple participant firms and trading accounts:

* **Clearing account** - Acts as the collateral account for trading
* **Customer accounts** - Segregated customer funds
* **Non-customer accounts** - Proprietary trading

Additional accounts can be created as needed via API or administrator interface.

## Order Entry

**FIX API**

* Use `NewOrderSingle` to submit orders
* Use `OrderCancelReplace` to modify orders
* View our [FIX API documentation](/institutional/fix-api/fix-overview)

**REST & gRPC APIs**

* Download [proto files](/streaming-endpoints/proto-reference) and generate bindings
* Subscribe to order updates before sending orders
* View our [REST API documentation](/api-reference/introduction)

## Risk Management

FCMs manage daily trading limits and position risk for their customers. The clearing account provides collateral for trading operations.

## Reporting

FCMs are responsible for Part 17 reporting for their customers in accordance with CFTC requirements.
