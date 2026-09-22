> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Get trade stats

> Gets aggregated trade data for a given period of time



## OpenAPI

````yaml /institutional/oapi-schemas/report-schema.json post /v1/report/trades/stats
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
  /v1/report/trades/stats:
    post:
      tags:
        - Report
      summary: Get trade stats
      description: Gets aggregated trade data for a given period of time
      operationId: ReportAPI_GetTradeStats
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/GetTradeStatsRequest'
        required: true
      responses:
        '200':
          description: A successful response.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/GetTradeStatsResponse'
components:
  schemas:
    GetTradeStatsRequest:
      type: object
      properties:
        symbol:
          type: string
        startTime:
          type: string
          format: date-time
        endTime:
          type: string
          format: date-time
        bars:
          type: integer
          format: int32
        startTradeDate:
          $ref: '#/components/schemas/Date'
        endTradeDate:
          $ref: '#/components/schemas/Date'
    GetTradeStatsResponse:
      type: object
      properties:
        stats:
          $ref: '#/components/schemas/TradeStats'
        bars:
          type: array
          items:
            $ref: '#/components/schemas/TradeStats'
            type: object
        barStartTime:
          type: array
          items:
            type: string
            format: date-time
        barEndTime:
          type: array
          items:
            type: string
            format: date-time
    Date:
      type: object
      properties:
        year:
          type: integer
          format: int32
        month:
          type: integer
          format: int32
        day:
          type: integer
          format: int32
      description: Date represents a calendar date.
    TradeStats:
      type: object
      properties:
        first:
          type: string
          format: int64
          title: First trade price in a collection of trades
        last:
          type: string
          format: int64
          title: Last trade price in a collection of trades
        high:
          type: string
          format: int64
          title: High trade price in a collection of trades
        low:
          type: string
          format: int64
          title: Low trade price in a collection of trades
        totalTradeCount:
          type: string
          format: int64
          title: Total number of trades
        clearedTradeCount:
          type: string
          format: int64
          title: The number of cleared trades
        volume:
          type: string
          format: int64
          title: Volume (total shares traded) in this time
        clearedVolume:
          type: string
          format: int64
          title: Volume (total shares traded) that has been cleared
        notional:
          type: string
          format: int64
          title: Total notional traded in this time
        clearedNotional:
          type: string
          format: int64
          title: Total notional traded in this time that has been cleared
      description: TradeStats are a collection of stats on a set of trades.

````