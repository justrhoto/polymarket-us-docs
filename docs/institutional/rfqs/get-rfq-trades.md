> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Get RFQ trades

> Query trades originating from RFQs.



## OpenAPI

````yaml /institutional/oapi-schemas/rfqs-schema.json get /v1/rfqs/trades
openapi: 3.0.3
info:
  title: RFQ API
  version: v1.0.0
servers:
  - url: https://api.prod.polymarketexchange.com
    description: Production server
security:
  - bearerAuth: []
tags:
  - name: RFQs
    description: Read and manage combo RFQs and quotes.
paths:
  /v1/rfqs/trades:
    get:
      tags:
        - RFQs
      summary: Get RFQ trades
      description: Query trades originating from RFQs.
      operationId: RFQAPI_GetRFQTrades
      parameters:
        - name: limit
          description: Zero defaults to 100. Otherwise between 1 and 100, inclusive.
          in: query
          required: false
          schema:
            type: integer
            format: int32
            minimum: 1
            maximum: 100
            default: 100
        - name: cursor
          description: Repeat all filters and limit unchanged when continuing a query.
          in: query
          required: false
          schema:
            type: string
        - name: startTime
          description: >-
            Inclusive execution time. Defaults to the start of available
            coverage.
          in: query
          required: false
          schema:
            type: string
            format: date-time
        - name: endTime
          description: >-
            Exclusive execution time. Defaults to receipt time of the first
            request.
          in: query
          required: false
          schema:
            type: string
            format: date-time
        - name: symbol
          description: Exact, case-sensitive symbol; empty selects all symbols.
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
                $ref: '#/components/schemas/v1GetRFQTradesResponse'
components:
  schemas:
    v1GetRFQTradesResponse:
      type: object
      properties:
        trades:
          type: array
          items:
            $ref: '#/components/schemas/v1RFQTrade'
        cursor:
          type: string
          description: Empty ends this traversal. Requery time windows for late arrivals.
    v1RFQTrade:
      type: object
      properties:
        tradeId:
          type: string
        symbol:
          type: string
        price:
          type: string
        qtyDecimal:
          type: string
        aggressorSide:
          $ref: '#/components/schemas/v1Side'
        executedTime:
          type: string
          format: date-time
      description: >-
        An anonymous original fill. Later trade corrections are not reflected
        here.
    v1Side:
      type: string
      enum:
        - SIDE_BUY
        - SIDE_SELL
      description: Side indicates the side of an Order.
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

````