> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Modify Order v2

> Modify an existing order in the marketplace. Allows changing price, quantity, time in force, and other parameters.



## OpenAPI

````yaml /api-reference/oapi-schemas/orders-v2-schema.json post /v2/order/{orderId}/modify
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
  /v2/order/{orderId}/modify:
    post:
      tags:
        - Orders v2
      summary: Modify Order v2
      description: >-
        Modify an existing order in the marketplace. Allows changing price,
        quantity, time in force, and other parameters.
      operationId: OrdersV2_ModifyOrder
      parameters:
        - name: orderId
          description: Exchange-assigned Order ID to modify
          in: path
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: >-
                #/components/schemas/gateway.orders.v2.OrdersService.ModifyOrderBody
      responses:
        '200':
          description: Order modification acknowledged
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/gateway.orders.v2.ModifyOrderResponse'
        '400':
          description: >-
            Invalid order input or exchange rejection. Disabled FOK returns "FOK
            orders are disabled".
        '401':
          description: Authentication required.
        '403':
          description: Trading role, session or eligibility restriction.
        '503':
          description: Unavailable or outcome unknown; reconcile before retrying.
      x-codeSamples:
        - lang: curl
          label: cURL
          source: |-
            curl --request POST \
              --url 'https://api.polymarket.us/v2/order/<order-id>/modify' \
              --header 'Content-Type: application/json' \
              --header 'X-PM-Access-Key: <key-id>' \
              --header 'X-PM-Timestamp: <unix-timestamp-ms>' \
              --header 'X-PM-Signature: <base64-signature>' \
              --data '{
                "marketSlug": "your-market-slug",
                "price": {"value": "0.17", "currency": "USD"},
                "quantity": "12",
                "time_in_force": "TIME_IN_FORCE_GOOD_TILL_CANCEL"
              }'
components:
  schemas:
    gateway.orders.v2.OrdersService.ModifyOrderBody:
      type: object
      properties:
        marketSlug:
          type: string
          description: Instrument's market slug.
        price:
          $ref: '#/components/schemas/gateway.types.v1.Amount'
          description: Replacement YES book price in USD.
        quantity:
          type: string
          format: decimal
          description: >-
            New total shares as a decimal string, including shares already
            filled.
        time_in_force:
          $ref: '#/components/schemas/gateway.orders.v1.TimeInForce'
          description: Replacement lifetime.
        post_only:
          type: boolean
          description: Require maker-only execution.
        good_till_time_ms:
          oneOf:
            - type: integer
              format: int64
            - type: string
              pattern: ^-?[0-9]+$
          description: >-
            Expiration in whole Unix milliseconds. Required with
            TIME_IN_FORCE_GOOD_TILL_DATE.
          example: 1798761600000
      description: Side cannot be changed.
      required:
        - marketSlug
        - price
        - quantity
        - time_in_force
    gateway.orders.v2.ModifyOrderResponse:
      type: object
      description: >-
        Replacement request acknowledgement. Reconcile order to confirm final
        state.
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