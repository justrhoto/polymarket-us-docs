> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Download account balance ledger as CSV

> Streams balance ledger as CSV.



## OpenAPI

````yaml /institutional/oapi-schemas/funding-schema.json get /v1/funding/balance-ledger/download
openapi: 3.0.1
info:
  title: Funding API
  description: >-
    Account balance ledger endpoints. Tracks every change to an account's cash
    balance with both a delta (`before_balance` -> `after_balance`) and a typed
    `entry_type`.
  version: v1.0.0
servers:
  - url: https://api.prod.polymarketexchange.com
security: []
tags:
  - name: Funding
paths:
  /v1/funding/balance-ledger/download:
    get:
      tags:
        - Funding
      summary: Download account balance ledger as CSV
      description: Streams balance ledger as CSV.
      operationId: FundingAPI_DownloadBalanceLedger
      parameters:
        - name: account
          in: query
          required: true
          schema:
            type: string
          description: Required. Fully qualified resource name of the account.
        - name: currency
          in: query
          required: false
          schema:
            type: string
          description: Optional. ISO currency code.
        - name: start_time
          in: query
          required: false
          schema:
            type: string
            format: date-time
          description: >-
            Optional. Inclusive lower bound on `update_time`. Clamped to
            `2026-05-01T00:00:00Z`.
        - name: end_time
          in: query
          required: false
          schema:
            type: string
            format: date-time
          description: Optional. Inclusive upper bound on `update_time`.
        - name: entry_types
          in: query
          required: false
          schema:
            type: array
            items:
              $ref: '#/components/schemas/LedgerEntryType'
          description: >-
            Optional. Filter by one or more entry types from the allowlist. When
            omitted, the gateway substitutes the full allowlist before
            forwarding upstream.
        - name: symbol
          in: query
          required: false
          schema:
            type: string
          description: Optional. Filter by instrument symbol.
        - name: description
          in: query
          required: false
          schema:
            type: string
            maxLength: 200
          description: >-
            Optional. Substring filter on the entry `description`. Maximum 200
            Unicode characters.
        - name: newest_first
          in: query
          required: false
          schema:
            type: boolean
          description: >-
            Optional. If `true`, rows are emitted in descending `update_time`
            order.
        - name: page_size
          in: query
          required: false
          schema:
            type: integer
            format: int32
            maximum: 1000
          description: >-
            Optional. Maximum entries per page (max 1000). Values above 1000
            return `InvalidArgument`.
        - name: page_token
          in: query
          required: false
          schema:
            type: string
          description: Optional. Resume token from a previous download.
      responses:
        '200':
          description: A successful response (streaming).
          content:
            text/csv:
              schema:
                type: string
                description: CSV file stream containing balance ledger entries.
components:
  schemas:
    LedgerEntryType:
      type: string
      enum:
        - DEPOSIT
        - WITHDRAWAL
        - ORDER_EXECUTION
        - CORRECTION
        - RESOLUTION
        - MANUAL_ADJUSTMENT
        - ACCOUNT_PROPERTY_ADJUSTMENT
        - COMMISSION
        - WITHDRAWAL_REJECTION
        - MANUAL_TRANSFER
        - PENDING_WITHDRAWAL_CREATION
      description: >-
        Allowlist of balance-ledger entry types that are exposed to clients.
        Internal exchange types (`NETTING`, `SECURITY_*`, `CONTRACT_EXPIRATION`,
        `BEGINNING_OF_DAY`, `INTEREST`, `SETTLEMENT_FEE`, etc.) are suppressed:
        requesting a suppressed type returns `Aborted` (409), and any suppressed
        types in upstream responses are silently filtered.

````