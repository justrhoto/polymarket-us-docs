> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Download position ledger as CSV

> Streams position ledger as CSV.



## OpenAPI

````yaml /institutional/oapi-schemas/positions-schema.json get /v1/positions/ledger/download
openapi: 3.0.3
info:
  title: Positions API
  version: v1.0.0
servers:
  - url: https://api.prod.polymarketexchange.com
    description: Production server
security:
  - bearerAuth: []
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
        - name: newestFirst
          in: query
          required: false
          schema:
            type: boolean
      responses:
        '200':
          description: A successful response.(streaming responses)
          content:
            application/json:
              schema:
                type: object
                properties:
                  result:
                    $ref: '#/components/schemas/v1DownloadPositionLedgerResponse'
                title: Stream result of v1DownloadPositionLedgerResponse
components:
  schemas:
    v1DownloadPositionLedgerResponse:
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