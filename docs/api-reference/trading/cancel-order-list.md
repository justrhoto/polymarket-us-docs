> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Cancel order list

> Requests cancellation of multiple working orders



## OpenAPI

````yaml /institutional/oapi-schemas/trading-schema.json post /v1/trading/orders/cancel/list
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
  /v1/trading/orders/cancel/list:
    post:
      tags:
        - Trading
      summary: Cancel order list
      description: Requests cancellation of multiple working orders
      operationId: OrderEntryAPI_CancelOrderList
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/v1CancelOrderListRequest'
        required: true
      responses:
        '200':
          description: A successful response.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/v1CancelOrderListResponse'
components:
  schemas:
    v1CancelOrderListRequest:
      type: object
      properties:
        requests:
          type: array
          items:
            $ref: '#/components/schemas/v1CancelOrderRequest'
    v1CancelOrderListResponse:
      type: object
      properties:
        responses:
          type: array
          items:
            $ref: '#/components/schemas/v1CancelOrderResponse'
    v1CancelOrderRequest:
      type: object
      properties:
        orderId:
          type: string
        clordId:
          type: string
        symbol:
          type: string
    v1CancelOrderResponse:
      type: object
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

````