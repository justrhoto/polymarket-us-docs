> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Cancel order list

> Requests cancellation of multiple working orders. Maximum batch size is 20 orders; requests exceeding this limit will be rejected.



## OpenAPI

````yaml /institutional/oapi-schemas/trading-schema.json post /v1/trading/orders/cancel/list
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
  /v1/trading/orders/cancel/list:
    post:
      tags:
        - Trading
      summary: Cancel order list
      description: >-
        Requests cancellation of multiple working orders. Maximum batch size is
        20 orders; requests exceeding this limit will be rejected.
      operationId: OrderEntryAPI_CancelOrderList
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CancelOrderListRequest'
        required: true
      responses:
        '200':
          description: A successful response.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/CancelOrderListResponse'
components:
  schemas:
    CancelOrderListRequest:
      type: object
      properties:
        requests:
          type: array
          items:
            $ref: '#/components/schemas/CancelOrderRequest'
            type: object
    CancelOrderListResponse:
      type: object
      properties:
        responses:
          type: array
          items:
            $ref: '#/components/schemas/CancelOrderResponse'
            type: object
    CancelOrderRequest:
      type: object
      properties:
        orderId:
          type: string
        clordId:
          type: string
        symbol:
          type: string
    CancelOrderResponse:
      type: object

````