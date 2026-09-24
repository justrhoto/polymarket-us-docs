> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Download trades CSV

> Downloads trades as a CSV file stream



## OpenAPI

````yaml /institutional/oapi-schemas/report-schema.json post /v1/report/trades/csv
openapi: 3.0.3
info:
  title: Report API
  version: v1.0.0
servers:
  - url: https://api.prod.polymarketexchange.com
    description: Production server
security:
  - bearerAuth: []
tags:
  - name: ReportAPI
paths:
  /v1/report/trades/csv:
    post:
      tags:
        - Report
      summary: Download trades CSV
      description: Downloads trades as a CSV file stream
      operationId: ReportAPI_DownloadTrades
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/v1DownloadTradesRequest'
        required: true
      responses:
        '200':
          description: A successful response.(streaming responses)
          content:
            application/json:
              schema:
                type: object
                properties:
                  result:
                    $ref: '#/components/schemas/v1DownloadTradesResponse'
                title: Stream result of v1DownloadTradesResponse
components:
  schemas:
    v1DownloadTradesRequest:
      type: object
      properties:
        startTime:
          type: string
          format: date-time
        endTime:
          type: string
          format: date-time
        accounts:
          type: array
          items:
            type: string
    v1DownloadTradesResponse:
      type: object
      properties:
        filechunk:
          type: string
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

````