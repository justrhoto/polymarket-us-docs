> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Insert order

> Inserts an order into the exchange



## OpenAPI

````yaml /institutional/oapi-schemas/trading-schema.json post /v1/trading/orders
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
  /v1/trading/orders:
    post:
      tags:
        - Trading
      summary: Insert order
      description: Inserts an order into the exchange
      operationId: OrderEntryAPI_InsertOrder
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/v1InsertOrderRequest'
        required: true
      responses:
        '200':
          description: A successful response.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/v1InsertOrderResponse'
components:
  schemas:
    v1InsertOrderRequest:
      type: object
      properties:
        type:
          $ref: '#/components/schemas/v1OrderType'
        side:
          $ref: '#/components/schemas/v1Side'
        orderQty:
          type: string
          format: int64
        symbol:
          type: string
        price:
          type: string
          format: int64
        timeInForce:
          $ref: '#/components/schemas/v1TimeInForce'
        clordId:
          type: string
        account:
          type: string
        stopPrice:
          type: string
          format: int64
        minQty:
          type: string
          format: int64
        selfMatchPreventionId:
          type: string
        quote:
          type: string
        allOrNone:
          type: boolean
        sessionId:
          type: string
        user:
          type: string
        clientAccountId:
          type: string
        clientParticipantId:
          type: string
        participateDontInitiate:
          type: boolean
        cashOrderQty:
          type: string
          format: int64
        strictLimit:
          type: boolean
          description: >-
            Set if this particular order must be filled at the exact limit
            price.
        goodTillTime:
          type: string
          format: date-time
        bestLimit:
          type: boolean
          description: >-
            A flag for best limit pricing. Sets the limit order's price to the
            top of the book on the same side as the order.
        immediatelyExecutableLimit:
          type: boolean
          description: >-
            A flag for immediately executable limit pricing. Sets the price to
            the top of the book on the opposing side, so it can immediately
            match.
        selfMatchPreventionInstruction:
          $ref: '#/components/schemas/v1SelfMatchPreventionInstruction'
        orderCapacity:
          $ref: '#/components/schemas/v1OrderCapacity'
        ignorePriceValidityChecks:
          type: boolean
        manualOrderIndicator:
          $ref: '#/components/schemas/v1ManualOrderIndicator'
    v1InsertOrderResponse:
      type: object
      properties:
        orderId:
          type: string
    v1OrderType:
      type: string
      enum:
        - ORDER_TYPE_MARKET_TO_LIMIT
        - ORDER_TYPE_LIMIT
        - ORDER_TYPE_STOP
        - ORDER_TYPE_STOP_LIMIT
      description: OrderType indicates the type of an order.
    v1Side:
      type: string
      enum:
        - SIDE_BUY
        - SIDE_SELL
      description: Side indicates the side of an Order.
    v1TimeInForce:
      type: string
      enum:
        - TIME_IN_FORCE_DAY
        - TIME_IN_FORCE_GOOD_TILL_CANCEL
        - TIME_IN_FORCE_IMMEDIATE_OR_CANCEL
        - TIME_IN_FORCE_GOOD_TILL_TIME
        - TIME_IN_FORCE_FILL_OR_KILL
      description: TimeInForce specifies how long the order remains in effect.
    v1SelfMatchPreventionInstruction:
      type: string
      enum:
        - SELF_MATCH_PREVENTION_INSTRUCTION_REJECT_AGGRESSOR
        - SELF_MATCH_PREVENTION_INSTRUCTION_CANCEL_RESTING
        - SELF_MATCH_PREVENTION_INSTRUCTION_REMOVE_BOTH
      description: >-
        SelfMatchPreventionInstruction is the methodology used to handle self
        match prevention.
    v1OrderCapacity:
      type: string
      enum:
        - ORDER_CAPACITY_AGENCY
        - ORDER_CAPACITY_PRINCIPAL
        - ORDER_CAPACITY_PROPRIETARY
        - ORDER_CAPACITY_INDIVIDUAL
        - ORDER_CAPACITY_RISKLESS_PRINCIPAL
        - ORDER_CAPACITY_AGENT_FOR_OTHER_MEMBER
      description: OrderCapacity designates the capacity of the party placing an order.
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