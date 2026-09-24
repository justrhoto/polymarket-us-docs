> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Get account balance ledger

> Returns historical balance changes for an account.



## OpenAPI

````yaml /institutional/oapi-schemas/funding-schema.json get /v1/funding/balance-ledger
openapi: 3.0.3
info:
  title: Funding API
  version: v1.0.0
servers:
  - url: https://api.prod.polymarketexchange.com
    description: Production server
security:
  - bearerAuth: []
tags:
  - name: Funding
paths:
  /v1/funding/balance-ledger:
    get:
      tags:
        - Funding
      summary: Get account balance ledger
      description: Returns historical balance changes for an account.
      operationId: FundingAPI_GetAccountBalanceLedger
      parameters:
        - name: account
          in: query
          required: true
          schema:
            type: string
          description: >-
            Required. Fully qualified resource name of the account. Example:
            `firms/ISV-Alice/accounts/alice-trading`.
        - name: currency
          in: query
          required: false
          schema:
            type: string
          description: >-
            Optional. ISO currency code (e.g., `USD`). Omit to return entries in
            all currencies for the account.
        - name: startTime
          in: query
          required: false
          schema:
            type: string
            format: date-time
        - name: endTime
          in: query
          required: false
          schema:
            type: string
            format: date-time
        - name: entryTypes
          in: query
          required: false
          explode: true
          schema:
            type: array
            items:
              type: string
              enum:
                - LEDGER_ENTRY_TYPE_BALANCE_DEPOSIT
                - LEDGER_ENTRY_TYPE_BALANCE_WITHDRAWAL
                - LEDGER_ENTRY_TYPE_BALANCE_ORDER_EXECUTION
                - LEDGER_ENTRY_TYPE_BALANCE_CORRECTION
                - LEDGER_ENTRY_TYPE_BALANCE_NETTING
                - LEDGER_ENTRY_TYPE_BALANCE_RESOLUTION
                - LEDGER_ENTRY_TYPE_BALANCE_MANUAL_ADJUSTMENT
                - LEDGER_ENTRY_TYPE_BALANCE_SECURITY_BALANCE_ADJUSTMENT
                - LEDGER_ENTRY_TYPE_BALANCE_SECURITY_MARK_TO_MARKET
                - LEDGER_ENTRY_TYPE_BALANCE_ACCOUNT_PROPERTY_ADJUSTMENT
                - LEDGER_ENTRY_TYPE_BALANCE_COMMISSION
                - LEDGER_ENTRY_TYPE_BALANCE_CONTRACT_EXPIRATION
                - LEDGER_ENTRY_TYPE_BALANCE_PENDING_CREDIT_ADJUSTMENT
                - LEDGER_ENTRY_TYPE_BALANCE_BEGINNING_OF_DAY
                - LEDGER_ENTRY_TYPE_BALANCE_SECURITY_WITHDRAWAL
                - LEDGER_ENTRY_TYPE_BALANCE_WITHDRAWAL_REJECTION
                - LEDGER_ENTRY_TYPE_BALANCE_MANUAL_TRANSFER
                - LEDGER_ENTRY_TYPE_BALANCE_AVERAGE_PRICE_TRANSFER
                - LEDGER_ENTRY_TYPE_BALANCE_GIVE_UP
                - LEDGER_ENTRY_TYPE_BALANCE_SYNCHRONIZATION
                - LEDGER_ENTRY_TYPE_BALANCE_INTEREST
                - LEDGER_ENTRY_TYPE_BALANCE_PENDING_WITHDRAWAL_CREATION
                - LEDGER_ENTRY_TYPE_BALANCE_SETTLEMENT_FEE
        - name: symbol
          in: query
          required: false
          schema:
            type: string
          description: >-
            Optional. Filter by instrument symbol (e.g., for `ORDER_EXECUTION`
            entries).
        - name: description
          in: query
          required: false
          schema:
            type: string
          description: >-
            Optional. Substring filter on the entry `description`. Maximum 200
            Unicode characters (not bytes); longer values return
            `InvalidArgument`.
        - name: newestFirst
          in: query
          required: false
          schema:
            type: boolean
        - name: pageSize
          in: query
          required: false
          schema:
            type: integer
            format: int32
            maximum: 1000
        - name: pageToken
          in: query
          required: false
          schema:
            type: string
      responses:
        '200':
          description: A successful response.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/v1GetAccountBalanceLedgerResponse'
components:
  schemas:
    v1GetAccountBalanceLedgerResponse:
      type: object
      properties:
        entries:
          type: array
          items:
            $ref: '#/components/schemas/v1BalanceLedgerEntry'
          description: >-
            Balance ledger entries for the requested account / time window.
            Suppressed entry types are filtered out.
        nextPageToken:
          type: string
          description: >-
            Pagination token to fetch the next page. Empty when there are no
            more results.
        eof:
          type: boolean
          description: '`true` when this response contains the final page of results.'
    v1BalanceLedgerEntry:
      type: object
      properties:
        id:
          type: string
          description: Unique entry identifier.
        account:
          type: string
          description: >-
            Account this entry belongs to. Example:
            `firms/ISV-Alice/accounts/alice-trading`.
        currency:
          type: string
          description: ISO currency code (e.g., `USD`).
        beforeBalance:
          type: string
          description: Account balance immediately before this change (decimal string).
        afterBalance:
          type: string
          description: Account balance immediately after this change (decimal string).
        description:
          type: string
        updateTime:
          type: string
          format: date-time
          description: Timestamp of the balance change.
        modifiedSecurityId:
          type: string
          description: >-
            Security ID associated with the change, if any (e.g., for
            `ORDER_EXECUTION` or `RESOLUTION` entries).
        entryType:
          $ref: '#/components/schemas/v1LedgerEntryType'
        symbol:
          type: string
          description: Instrument symbol associated with the change, if any.
        updateBusinessDate:
          type: string
          description: Business date for this change in `YYYY-MM-DD` format.
      description: >-
        A single balance ledger entry. Each entry records the cash balance
        before and after a single change, along with the typed `entry_type` and
        human-readable `description`.
    v1LedgerEntryType:
      type: string
      enum:
        - LEDGER_ENTRY_TYPE_BALANCE_DEPOSIT
        - LEDGER_ENTRY_TYPE_BALANCE_WITHDRAWAL
        - LEDGER_ENTRY_TYPE_BALANCE_ORDER_EXECUTION
        - LEDGER_ENTRY_TYPE_BALANCE_CORRECTION
        - LEDGER_ENTRY_TYPE_BALANCE_NETTING
        - LEDGER_ENTRY_TYPE_BALANCE_RESOLUTION
        - LEDGER_ENTRY_TYPE_BALANCE_MANUAL_ADJUSTMENT
        - LEDGER_ENTRY_TYPE_BALANCE_SECURITY_BALANCE_ADJUSTMENT
        - LEDGER_ENTRY_TYPE_BALANCE_SECURITY_MARK_TO_MARKET
        - LEDGER_ENTRY_TYPE_BALANCE_ACCOUNT_PROPERTY_ADJUSTMENT
        - LEDGER_ENTRY_TYPE_BALANCE_COMMISSION
        - LEDGER_ENTRY_TYPE_BALANCE_CONTRACT_EXPIRATION
        - LEDGER_ENTRY_TYPE_BALANCE_PENDING_CREDIT_ADJUSTMENT
        - LEDGER_ENTRY_TYPE_BALANCE_BEGINNING_OF_DAY
        - LEDGER_ENTRY_TYPE_BALANCE_SECURITY_WITHDRAWAL
        - LEDGER_ENTRY_TYPE_BALANCE_WITHDRAWAL_REJECTION
        - LEDGER_ENTRY_TYPE_BALANCE_MANUAL_TRANSFER
        - LEDGER_ENTRY_TYPE_BALANCE_AVERAGE_PRICE_TRANSFER
        - LEDGER_ENTRY_TYPE_BALANCE_GIVE_UP
        - LEDGER_ENTRY_TYPE_BALANCE_SYNCHRONIZATION
        - LEDGER_ENTRY_TYPE_BALANCE_INTEREST
        - LEDGER_ENTRY_TYPE_BALANCE_PENDING_WITHDRAWAL_CREATION
        - LEDGER_ENTRY_TYPE_BALANCE_SETTLEMENT_FEE
      description: >-
        LedgerEntryType enumerates the balance-affecting events Polymarket
        exposes

        publicly. Values marked [deprecated = true] are internal exchange entry
        types

        that Polymarket suppresses at the gateway: requests carrying a
        deprecated

        value are rejected with HTTP 409 (codes.Aborted), and entries with those

        types are filtered out of every response. The names remain so client
        SDKs

        can surface deprecation warnings and so grpc-gateway accepts the value
        at

        parse time, letting our handler return a uniform helpful error.
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

````