> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Cancel all open orders

> Requests cancellation of every open order for the authenticated firm, across its accounts and sessions. Send an empty JSON object (`{}`).
This endpoint does not accept market, event, account, order-group, or other filters.
A successful response is an empty JSON object (`{}`) and means the request was submitted. Confirm individual cancellations through order or execution updates.



## OpenAPI

````yaml /institutional/oapi-schemas/trading-schema.json post /v1/trading/orders/cancel/all-open
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
  /v1/trading/orders/cancel/all-open:
    post:
      tags:
        - Trading
      summary: Cancel all open orders
      description: >-
        Requests cancellation of every open order for the authenticated firm,
        across its accounts and sessions. Send an empty JSON object (`{}`).

        This endpoint does not accept market, event, account, order-group, or
        other filters.

        A successful response is an empty JSON object (`{}`) and means the
        request was submitted. Confirm individual cancellations through order or
        execution updates.
      operationId: OrderEntryAPI_CancelAllOpenOrders
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/v1CancelAllOpenOrdersRequest'
        required: true
      responses:
        '200':
          description: A successful response.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/v1CancelAllOpenOrdersResponse'
components:
  schemas:
    v1CancelAllOpenOrdersRequest:
      type: object
      description: >-
        Empty request. The authenticated firm determines the scope; no filters
        are supported.
      example: {}
    v1CancelAllOpenOrdersResponse:
      type: object
      description: >-
        Empty response acknowledging submission of the cancellation request.
        Confirm individual cancellations through order or execution updates.
      example: {}
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

````

This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.