> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Get RFQs

> Returns RFQs matching the query filters.



## OpenAPI

````yaml /institutional/oapi-schemas/rfqs-schema.json get /v1/rfqs
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
  /v1/rfqs:
    get:
      tags:
        - RFQs
      summary: Get RFQs
      description: Returns RFQs matching the query filters.
      operationId: RFQAPI_GetRFQs
      parameters:
        - name: limit
          in: query
          required: false
          schema:
            type: integer
            format: int32
            minimum: 1
            maximum: 100
            default: 100
        - name: cursor
          in: query
          required: false
          schema:
            type: string
        - name: rfqId
          in: query
          required: false
          schema:
            type: string
        - name: symbol
          in: query
          required: false
          schema:
            type: string
        - name: status
          in: query
          required: false
          schema:
            type: string
            enum:
              - RFQ_STATUS_OPEN
              - RFQ_STATUS_CLOSED
        - name: userFilter
          in: query
          required: false
          schema:
            type: string
            enum:
              - USER_FILTER_SELF
      responses:
        '200':
          description: A successful response.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/v1GetRFQsResponse'
components:
  schemas:
    v1GetRFQsResponse:
      type: object
      properties:
        rfqs:
          type: array
          items:
            $ref: '#/components/schemas/v1RFQ'
        cursor:
          type: string
    v1RFQ:
      type: object
      properties:
        id:
          type: string
        qtyDecimal:
          type: string
          nullable: true
        cashOrderQty:
          type: string
          nullable: true
        symbol:
          type: string
        rfqCreatorUserId:
          type: string
        createdTime:
          type: string
          format: date-time
        restRemainder:
          type: boolean
        status:
          $ref: '#/components/schemas/v1RFQStatus'
        updatedTime:
          type: string
          format: date-time
        comboLegs:
          type: array
          items:
            $ref: '#/components/schemas/v1RFQComboLeg'
        tickSize:
          type: number
          format: double
          description: >-
            Instrument minimum price increment in dollars. Absent when metadata
            is unavailable.
          nullable: true
    v1RFQStatus:
      type: string
      enum:
        - RFQ_STATUS_OPEN
        - RFQ_STATUS_CLOSED
    v1RFQComboLeg:
      type: object
      properties:
        symbol:
          type: string
        side:
          $ref: '#/components/schemas/v1Side'
        settlementPrice:
          type: string
          description: |-
            Raw YES/LONG settlement normalized to [0,1].
            Absent until a valid terminal settlement has been projected.
          nullable: true
      required:
        - symbol
        - side
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