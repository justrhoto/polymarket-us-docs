> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Download position ledger as CSV

> Streams position ledger as CSV.



## OpenAPI

````yaml /institutional/oapi-schemas/positions-schema.json get /v1/positions/ledger/download
openapi: 3.0.1
info:
  title: Positions API
  version: v1.0.0
servers:
  - url: https://api.prod.polymarketexchange.com
security: []
tags:
  - name: PositionAPI
paths:
  /v1/positions/ledger/download:
    get:
      tags:
        - Positions
      summary: Download position ledger as CSV
      description: Streams position ledger as CSV.
      operationId: PositionAPI_DownloadPositionLedger
      parameters:
        - name: account
          in: query
          required: true
          schema:
            type: string
          description: Required. Fully qualified resource name of the account.
        - name: symbol
          in: query
          required: false
          schema:
            type: string
          description: Optional. Filter by instrument symbol.
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
        - name: newest_first
          in: query
          required: false
          schema:
            type: boolean
          description: >-
            Optional. If `true`, rows are emitted in descending `update_time`
            order.
      responses:
        '200':
          description: A successful response (streaming).
          content:
            text/csv:
              schema:
                type: string
                description: CSV file stream containing position ledger entries.

````