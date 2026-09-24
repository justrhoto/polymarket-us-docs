> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Download executions CSV

> Downloads executions as a CSV file stream



## OpenAPI

````yaml /institutional/oapi-schemas/report-schema.json post /v1/report/executions/csv
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
  /v1/report/executions/csv:
    post:
      tags:
        - Report
      summary: Download executions CSV
      description: Downloads executions as a CSV file stream
      operationId: ReportAPI_DownloadExecutions
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/v1DownloadExecutionsRequest'
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
                    $ref: '#/components/schemas/v1DownloadExecutionsResponse'
                title: Stream result of v1DownloadExecutionsResponse
components:
  schemas:
    v1DownloadExecutionsRequest:
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
    v1DownloadExecutionsResponse:
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