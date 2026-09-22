> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Cancel replace order list

> Requests modification of multiple working orders. Maximum batch size is 20 orders; requests exceeding this limit will be rejected.



## OpenAPI

````yaml /institutional/oapi-schemas/trading-schema.json post /v1/trading/orders/replace/list
openapi: 3.0.1
info:
  title: Trading API
  version: v1.0.0
servers:
  - url: https://api.prod.polymarketexchange.com
security: []
tags:
  - name: OrderEntryAPI
paths:
  /v1/trading/orders/replace/list:
    post:
      tags:
        - Trading
      summary: Cancel replace order list
      description: >-
        Requests modification of multiple working orders. Maximum batch size is
        20 orders; requests exceeding this limit will be rejected.
      operationId: OrderEntryAPI_CancelReplaceOrderList
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CancelReplaceOrderListRequest'
        required: true
      responses:
        '200':
          description: A successful response.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/CancelReplaceOrderListResponse'
components:
  schemas:
    CancelReplaceOrderListRequest:
      type: object
      properties:
        requests:
          type: array
          items:
            $ref: '#/components/schemas/CancelReplaceOrderRequest'
            type: object
    CancelReplaceOrderListResponse:
      type: object
      properties:
        responses:
          type: array
          items:
            $ref: '#/components/schemas/CancelReplaceOrderResponse'
            type: object
    CancelReplaceOrderRequest:
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
          $ref: '#/components/schemas/TimeInForce'
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
          $ref: '#/components/schemas/ManualOrderIndicator'
    CancelReplaceOrderResponse:
      type: object
    TimeInForce:
      type: string
      enum:
        - TIME_IN_FORCE_DAY
        - TIME_IN_FORCE_GOOD_TILL_CANCEL
        - TIME_IN_FORCE_IMMEDIATE_OR_CANCEL
        - TIME_IN_FORCE_GOOD_TILL_TIME
        - TIME_IN_FORCE_FILL_OR_KILL
      description: TimeInForce specifies how long the order remains in effect.
    ManualOrderIndicator:
      type: string
      enum:
        - MANUAL_ORDER_INDICATOR_MANUAL
        - MANUAL_ORDER_INDICATOR_AUTOMATED
      description: >-
        ManualOrderIndicator designates the manual or automated nature of an
        order.

````