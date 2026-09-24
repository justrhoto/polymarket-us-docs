> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Download account balance ledger as CSV

> Streams balance ledger as CSV.



## OpenAPI

````yaml /institutional/oapi-schemas/funding-schema.json get /v1/funding/balance-ledger/download
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
          description: Optional. Filter by instrument symbol.
        - name: description
          in: query
          required: false
          schema:
            type: string
          description: >-
            Optional. Substring filter on the entry `description`. Maximum 200
            Unicode characters.
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
          description: A successful response.(streaming responses)
          content:
            application/json:
              schema:
                type: object
                properties:
                  result:
                    $ref: '#/components/schemas/v1DownloadBalanceLedgerResponse'
                title: Stream result of v1DownloadBalanceLedgerResponse
components:
  schemas:
    v1DownloadBalanceLedgerResponse:
      type: object
      properties:
        data:
          type: string
          format: byte
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

````