> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Download orders CSV

> Downloads orders as a CSV file stream



## OpenAPI

````yaml /institutional/oapi-schemas/report-schema.json post /v1/report/orders/csv
openapi: 3.0.1
info:
  title: Report API
  version: v1.0.0
servers:
  - url: https://api.prod.polymarketexchange.com
security: []
tags:
  - name: ReportAPI
paths:
  /v1/report/orders/csv:
    post:
      tags:
        - Report
      summary: Download orders CSV
      description: Downloads orders as a CSV file stream
      operationId: ReportAPI_DownloadOrders
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/DownloadOrdersRequest'
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
                    $ref: '#/components/schemas/DownloadOrdersResponse'
                title: Stream result of v1DownloadOrdersResponse
components:
  schemas:
    DownloadOrdersRequest:
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
    DownloadOrdersResponse:
      type: object
      properties:
        filechunk:
          type: string

````