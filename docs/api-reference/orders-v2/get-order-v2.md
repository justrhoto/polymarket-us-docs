> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Order v2

> Get details for a specific order by its exchange-assigned ID



## OpenAPI

````yaml /api-reference/oapi-schemas/orders-v2-schema.json get /v2/order/{orderId}
openapi: 3.0.3
info:
  title: 'Orders v2: YES order book'
  version: 2.0.0
  description: Limit orders sized in shares with side BID/ASK and YES book prices.
servers:
  - url: https://api.polymarket.us
security:
  - X-PM-Access-Key: []
    X-PM-Timestamp: []
    X-PM-Signature: []
tags:
  - name: Orders v2
paths:
  /v2/order/{orderId}:
    get:
      tags:
        - Orders v2
      summary: Get Order v2
      description: Get details for a specific order by its exchange-assigned ID
      operationId: OrdersV2_GetOrder
      parameters:
        - name: orderId
          description: Exchange-assigned Order ID to retrieve
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Order retrieved successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/gateway.orders.v2.GetOrderResponse'
        '400':
          description: Bad request - invalid order request
        '401':
          description: Authentication required.
        '404':
          description: Order not found
        '503':
          description: Order lookup is unavailable. Retry the read.
      x-codeSamples:
        - lang: curl
          label: cURL
          source: |-
            curl --request GET \
              --url 'https://api.polymarket.us/v2/order/<order-id>' \
              --header 'X-PM-Access-Key: <key-id>' \
              --header 'X-PM-Timestamp: <unix-timestamp-ms>' \
              --header 'X-PM-Signature: <base64-signature>'
components:
  schemas:
    gateway.orders.v2.GetOrderResponse:
      type: object
      properties:
        order:
          $ref: '#/components/schemas/gateway.orders.v2.Order'
          description: Current order, including orders created through v1.
      description: Current order snapshot.
    gateway.orders.v2.Order:
      type: object
      properties:
        id:
          type: string
          description: Exchange-assigned ID.
        marketSlug:
          type: string
          description: Instrument's market slug.
        side:
          $ref: '#/components/schemas/gateway.orders.v2.Side'
          description: Order side.
        type:
          $ref: '#/components/schemas/gateway.orders.v1.OrderType'
          description: Order type.
        price:
          $ref: '#/components/schemas/gateway.types.v1.Amount'
          description: >-
            YES limit price in USD. Value is "0" for market orders placed
            through v1.
        quantity:
          type: string
          format: decimal
          description: Total shares as a decimal string.
        cumQuantity:
          type: string
          format: decimal
          description: Filled shares as a decimal string.
        leavesQuantity:
          type: string
          format: decimal
          description: Remaining shares as a decimal string.
        time_in_force:
          $ref: '#/components/schemas/gateway.orders.v1.TimeInForce'
          description: Order lifetime.
        good_till_time_ms:
          type: string
          format: int64
          description: Exchange expiration in Unix milliseconds, when supplied.
        state:
          $ref: '#/components/schemas/gateway.orders.v1.OrderState'
          description: Current exchange state.
        commissionNotionalTotalCollected:
          $ref: '#/components/schemas/gateway.types.v1.Amount'
          description: Collected commissions in USD.
        avgPx:
          $ref: '#/components/schemas/gateway.types.v1.Amount'
          description: >-
            Average YES fill price in USD. Before the first fill, value is
            "0.0000".
        insert_time_ms:
          type: string
          format: int64
          description: >-
            Book insertion or priority time in Unix milliseconds. Retained when
            replacement preserves priority.
        create_time_ms:
          type: string
          format: int64
          description: Creation time in Unix milliseconds.
        last_transact_time_ms:
          type: string
          format: int64
          description: Most recent exchange update time in Unix milliseconds.
      description: Order on YES order book.
    gateway.orders.v2.Side:
      type: string
      enum:
        - BID
        - ASK
      description: |-
        Direction on the YES order book.

         - BID: Buy the instrument at a maximum YES price.
         - ASK: Sell the instrument at a minimum YES price.
    gateway.orders.v1.OrderType:
      type: string
      enum:
        - ORDER_TYPE_LIMIT
        - ORDER_TYPE_MARKET
    gateway.types.v1.Amount:
      type: object
      properties:
        value:
          type: string
          format: decimal
          example: 123.45
          description: The amount as a decimal string.
        currency:
          type: string
          description: The currency code
      description: Represents a monetary amount with its currency.
      required:
        - value
        - currency
    gateway.orders.v1.TimeInForce:
      type: string
      enum:
        - TIME_IN_FORCE_GOOD_TILL_CANCEL
        - TIME_IN_FORCE_GOOD_TILL_DATE
        - TIME_IN_FORCE_IMMEDIATE_OR_CANCEL
        - TIME_IN_FORCE_FILL_OR_KILL
    gateway.orders.v1.OrderState:
      type: string
      enum:
        - ORDER_STATE_NEW
        - ORDER_STATE_PARTIALLY_FILLED
        - ORDER_STATE_FILLED
        - ORDER_STATE_CANCELED
        - ORDER_STATE_REPLACED
        - ORDER_STATE_REJECTED
        - ORDER_STATE_EXPIRED
        - ORDER_STATE_PENDING_NEW
        - ORDER_STATE_PENDING_REPLACE
        - ORDER_STATE_PENDING_CANCEL
        - ORDER_STATE_PENDING_RISK
      description: |-
        Current order state.

         - ORDER_STATE_PENDING_NEW: Awaiting order processing by the exchange.
         - ORDER_STATE_PENDING_REPLACE: Awaiting replacement processing by the exchange.
         - ORDER_STATE_PENDING_CANCEL: Awaiting cancellation processing by the exchange.
         - ORDER_STATE_PENDING_RISK: Awaiting exchange risk approval.
  securitySchemes:
    X-PM-Access-Key:
      type: apiKey
      in: header
      name: X-PM-Access-Key
      description: >-
        Your API key ID (UUID). Generate at
        [polymarket.us/developer](https://polymarket.us/developer).
    X-PM-Timestamp:
      type: apiKey
      in: header
      name: X-PM-Timestamp
      description: >-
        Unix timestamp in milliseconds. Must be within 30 seconds of server
        time.
    X-PM-Signature:
      type: apiKey
      in: header
      name: X-PM-Signature
      description: >-
        Base64-encoded Ed25519 signature of `timestamp + method + path`. See
        [Authentication](/api/authentication) for details.

````

This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.