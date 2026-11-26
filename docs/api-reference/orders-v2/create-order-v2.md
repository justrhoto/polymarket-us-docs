> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Create Order v2

> Create a new limit order to enter into a market



## OpenAPI

````yaml /api-reference/oapi-schemas/orders-v2-schema.json post /v2/orders
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
  /v2/orders:
    post:
      tags:
        - Orders v2
      summary: Create Order v2
      description: Create a new limit order to enter into a market
      operationId: OrdersV2_CreateOrder
      parameters:
        - name: Idempotency-Key
          in: header
          description: >-
            Optionally include this key to request best-effort deduplication of
            retries for the same order. For example, if an order with that key
            was recently submitted, another submission with that key does not
            submit another order to the exchange. This is useful after a timeout
            or other ambiguous error, where it may not be clear if the order was
            submitted successfully or not.
          required: false
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/gateway.orders.v2.CreateOrderRequest'
            example:
              marketSlug: your-market-slug
              side: BID
              price:
                value: '0.17'
                currency: USD
              quantity: '10'
              time_in_force: TIME_IN_FORCE_GOOD_TILL_CANCEL
              post_only: true
      responses:
        '200':
          description: >-
            The exchange accepted the order. `executions` lists its fills and
            other events so far. Exchange rejections return 400 instead.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/gateway.orders.v2.CreateOrderResponse'
        '400':
          description: >-
            Invalid order input or exchange rejection. Unrecognized request
            fields return HTTP 400. A crossing post-only order returns
            POST_ONLY_WOULD_CROSS in an ErrorInfo detail. Disabled FOK returns
            "FOK orders are disabled".
        '401':
          description: Authentication required.
        '403':
          description: Trading role, session or eligibility restriction.
        '409':
          description: >-
            An expired, zero-fill FOK returns FOK_NOT_FILLED in an ErrorInfo
            detail.
        '503':
          description: >-
            Unavailable. If an ErrorInfo detail has reason
            ORDER_OUTCOME_UNKNOWN, reconcile by order ID before retrying.
      x-codeSamples:
        - lang: curl
          label: cURL
          source: |-
            curl --request POST \
              --url https://api.polymarket.us/v2/orders \
              --header 'Content-Type: application/json' \
              --header 'X-PM-Access-Key: <key-id>' \
              --header 'X-PM-Timestamp: <unix-timestamp-ms>' \
              --header 'X-PM-Signature: <base64-signature>' \
              --data '{
                "marketSlug": "your-market-slug",
                "side": "BID",
                "price": {"value": "0.17", "currency": "USD"},
                "quantity": "10",
                "time_in_force": "TIME_IN_FORCE_GOOD_TILL_CANCEL"
              }'
components:
  schemas:
    gateway.orders.v2.CreateOrderRequest:
      type: object
      properties:
        marketSlug:
          type: string
          description: Instrument's market slug.
        side:
          $ref: '#/components/schemas/gateway.orders.v2.Side'
          description: BID buys and ASK sells YES-quoted instrument.
        price:
          type: object
          description: YES book price in USD.
          required:
            - value
            - currency
          properties:
            value:
              type: string
              format: decimal
              description: >-
                A decimal string greater than 0 and less than 1. Use the
                market's `orderPriceMinTickSize` to choose a valid price. For
                example, `"0.17"` and `"0.1700"` are equivalent on a market with
                a `0.01` tick. Off-tick prices are rejected.
            currency:
              type: string
              enum:
                - USD
              description: The currency code.
        quantity:
          type: string
          format: decimal
          description: Total quantity in shares as a decimal string.
        time_in_force:
          type: string
          enum:
            - TIME_IN_FORCE_GOOD_TILL_CANCEL
            - TIME_IN_FORCE_GOOD_TILL_DATE
            - TIME_IN_FORCE_IMMEDIATE_OR_CANCEL
            - TIME_IN_FORCE_FILL_OR_KILL
          default: TIME_IN_FORCE_GOOD_TILL_CANCEL
          description: >-
            Order lifetime. To set a specific expiry, use
            `TIME_IN_FORCE_GOOD_TILL_DATE` with `expiration_time_ms`.
        post_only:
          type: boolean
          default: false
          description: >-
            Require maker-only execution. Returns HTTP 400 if the order would
            take liquidity or if the time in force is IOC or FOK.
        expiration_time_ms:
          oneOf:
            - type: integer
              format: int64
            - type: string
              pattern: ^-?[0-9]+$
          description: >-
            Expiration in whole Unix milliseconds. Required with
            TIME_IN_FORCE_GOOD_TILL_DATE and rejected with other lifetimes.
          example: 1798761600000
      description: Limit order sized in shares.
      required:
        - marketSlug
        - side
        - price
        - quantity
    gateway.orders.v2.CreateOrderResponse:
      type: object
      properties:
        id:
          type: string
          description: Exchange order ID. Use it to look up or modify the order.
        executions:
          type: array
          items:
            $ref: '#/components/schemas/gateway.orders.v2.Execution'
            type: object
          description: >-
            The order's exchange events before this response: its
            acknowledgement, any fills and its final state, such as an IOC's
            expiry. The request waits up to 5 seconds for the order to fill,
            expire or be canceled. An order still resting then returns with its
            events so far.
        pending:
          type: boolean
          description: >-
            `true` if the exchange has the order but its events could not be
            read before this response. `executions` is then empty. Get the order
            by `id` or watch the private order stream.
      description: Accepted order and its exchange events so far.
    gateway.orders.v2.Side:
      type: string
      enum:
        - BID
        - ASK
      description: |-
        Direction on the YES order book.

         - BID: Buy the instrument at a maximum YES price.
         - ASK: Sell the instrument at a minimum YES price.
    gateway.orders.v2.Execution:
      type: object
      properties:
        id:
          type: string
          description: Exchange execution ID.
        order:
          $ref: '#/components/schemas/gateway.orders.v2.Order'
          description: Order snapshot.
        lastShares:
          type: string
          description: Filled shares on this event as a decimal string.
          format: decimal
        lastPx:
          $ref: '#/components/schemas/gateway.types.v1.Amount'
          description: YES fill price in USD.
        type:
          $ref: '#/components/schemas/gateway.orders.v1.ExecutionType'
          description: Event type.
        text:
          type: string
          description: Exchange event text, when present.
        transact_time_ms:
          type: string
          format: int64
          description: Execution time in Unix milliseconds.
        tradeId:
          type: string
          description: Exchange trade ID for fill reconciliation.
        aggressor:
          type: boolean
          description: Whether this execution aggressed the book.
        commissionNotionalCollected:
          $ref: '#/components/schemas/gateway.types.v1.Amount'
          description: Collected commission on this execution in USD.
      description: Execution event, including fills returned synchronously.
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
    gateway.orders.v1.ExecutionType:
      type: string
      enum:
        - EXECUTION_TYPE_NEW
        - EXECUTION_TYPE_PARTIAL_FILL
        - EXECUTION_TYPE_FILL
        - EXECUTION_TYPE_CANCELED
        - EXECUTION_TYPE_REPLACE
        - EXECUTION_TYPE_REJECTED
        - EXECUTION_TYPE_EXPIRED
        - EXECUTION_TYPE_DONE_FOR_DAY
      description: ExecutionType denotes the execution type.
    gateway.orders.v1.OrderType:
      type: string
      enum:
        - ORDER_TYPE_LIMIT
        - ORDER_TYPE_MARKET
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