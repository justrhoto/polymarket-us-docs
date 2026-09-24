> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Cancel replace order list

> Requests modification of multiple working orders



## OpenAPI

````yaml /institutional/oapi-schemas/trading-schema.json post /v1/trading/orders/replace/list
openapi: 3.0.3
info:
  title: Trading API
  version: v1.0.0
servers:
  - url: https://api.prod.polymarketexchange.com
    description: Production server
security:
  - bearerAuth: []
tags:
  - name: OrderEntryAPI
paths:
  /v1/trading/orders/replace/list:
    post:
      tags:
        - Trading
      summary: Cancel replace order list
      description: Requests modification of multiple working orders
      operationId: OrderEntryAPI_CancelReplaceOrderList
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/v1CancelReplaceOrderListRequest'
        required: true
      responses:
        '200':
          description: A successful response.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/v1CancelReplaceOrderListResponse'
components:
  schemas:
    v1CancelReplaceOrderListRequest:
      type: object
      properties:
        requests:
          type: array
          items:
            $ref: '#/components/schemas/v1CancelReplaceOrderRequest'
    v1CancelReplaceOrderListResponse:
      type: object
      properties:
        responses:
          type: array
          items:
            $ref: '#/components/schemas/v1CancelReplaceOrderResponse'
    v1CancelReplaceOrderRequest:
      type: object
      properties:
        orderId:
          type: string
        clordId:
          type: string
        symbol:
          type: string
        price:
          type: string
          format: int64
        orderQty:
          type: string
          format: int64
        timeInForce:
          $ref: '#/components/schemas/v1TimeInForce'
        stopPrice:
          type: string
          format: int64
        minQty:
          type: string
          format: int64
        allOrNone:
          type: boolean
        participateDontInitiate:
          type: boolean
        strictLimit:
          type: boolean
        goodTillTime:
          type: string
          format: date-time
        bestLimit:
          type: boolean
        immediatelyExecutableLimit:
          type: boolean
        manualOrderIndicator:
          $ref: '#/components/schemas/v1ManualOrderIndicator'
    v1CancelReplaceOrderResponse:
      type: object
    v1TimeInForce:
      type: string
      enum:
        - TIME_IN_FORCE_DAY
        - TIME_IN_FORCE_GOOD_TILL_CANCEL
        - TIME_IN_FORCE_IMMEDIATE_OR_CANCEL
        - TIME_IN_FORCE_GOOD_TILL_TIME
        - TIME_IN_FORCE_FILL_OR_KILL
      description: TimeInForce specifies how long the order remains in effect.
    v1ManualOrderIndicator:
      type: string
      enum:
        - MANUAL_ORDER_INDICATOR_MANUAL
        - MANUAL_ORDER_INDICATOR_AUTOMATED
      description: >-
        ManualOrderIndicator designates the manual or automated nature of an
        order.
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

````