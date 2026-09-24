> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Get open orders

> Returns a snapshot of working orders



## OpenAPI

````yaml /institutional/oapi-schemas/trading-schema.json get /v1/trading/orders/open
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
  /v1/trading/orders/open:
    get:
      tags:
        - Trading
      summary: Get open orders
      description: Returns a snapshot of working orders
      operationId: OrderEntryAPI_GetOpenOrders
      parameters:
        - name: symbols
          in: query
          required: false
          explode: true
          schema:
            type: array
            items:
              type: string
        - name: accounts
          in: query
          required: false
          explode: true
          schema:
            type: array
            items:
              type: string
      responses:
        '200':
          description: A successful response.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/v1GetOpenOrdersResponse'
components:
  schemas:
    v1GetOpenOrdersResponse:
      type: object
      properties:
        orders:
          type: array
          items:
            $ref: '#/components/schemas/v1Order'
    v1Order:
      type: object
      properties:
        id:
          type: string
          title: Exchange assigned ID for the order
        type:
          $ref: '#/components/schemas/v1OrderType'
        side:
          $ref: '#/components/schemas/v1Side'
        orderQty:
          type: string
          format: int64
        symbol:
          type: string
        clordId:
          type: string
          title: Client assigned ID for the order
        timeInForce:
          $ref: '#/components/schemas/v1TimeInForce'
        account:
          type: string
          title: Account is the trading account for this order
        cumQty:
          type: string
          format: int64
          title: Cumulative filled order qty
        avgPx:
          type: string
          format: int64
          title: Average fill price
        leavesQty:
          type: string
          format: int64
          title: Remaining working qty
        state:
          $ref: '#/components/schemas/v1OrderState'
        participant:
          type: string
          title: Participant that placed this order
        price:
          type: string
          format: int64
          title: Integer price representation (for limit, stop limit)
        insertTime:
          type: string
          format: date-time
          title: The time this order was inserted into the book
        stopPrice:
          type: string
          format: int64
          title: Integer stop price representation (for stop, stop limit)
        minQty:
          type: string
          format: int64
          title: Minimum quantity (optional for IOC time in force)
        createTime:
          type: string
          format: date-time
          title: The time this order was created
        allOrNone:
          type: boolean
          title: Set if all or none of the order qty should be filled
        crossId:
          type: string
          title: Client assigned Order Cross ID
        hostCrossId:
          type: string
          title: Exchange generated Host Cross ID
        submittingParticipant:
          type: string
          title: If this order is being submitted on behalf of another entity
        clientAccountId:
          type: string
          title: Client assigned free-form account ID for the order
        clientParticipantId:
          type: string
          title: Client assigned free-form participant ID for the order
        parentOrderId:
          type: string
          title: The parent order this order is the child of
        commissionsBasisPoints:
          type: string
          title: The total basis points associated with all commissions on this order
        participateDontInitiate:
          type: boolean
          title: Set if immediate match is not desired
        cashOrderQty:
          type: string
          format: int64
          title: Fixed point decimal representation of the total cash order qty
        strictLimit:
          type: boolean
          title: Set if this particular order must be filled at the exact limit price
        goodTillTime:
          type: string
          format: date-time
          title: >-
            The time at which this order shall expire if the time in force is
            GOOD_TILL_TIME
        bestLimit:
          type: boolean
          title: >-
            Context may contain additional meta data regarding the order
            (reserved)

            orders.v1beta1.OrderContext context = 35;

            A flag for best limit pricing
        immediatelyExecutableLimit:
          type: boolean
          title: A flag for immediately executable limit pricing
        lastTradeId:
          type: string
          title: Set to the last, most recent trade ID that this order was party to
        commissionNotionalTotalCollected:
          type: string
          format: int64
          title: >-
            The total notional value of all commissions collected on the order
            so far
        selfMatchPreventionInstruction:
          $ref: '#/components/schemas/v1SelfMatchPreventionInstruction'
        orderCapacity:
          $ref: '#/components/schemas/v1OrderCapacity'
        ignorePriceValidityChecks:
          type: boolean
          title: A flag indicating order is exempt from price validity checks
        lastTransactTime:
          type: string
          format: date-time
          title: The most recent time this order was updated in any capacity
        priceScale:
          type: string
          format: int64
          description: >-
            The price scale of the order, copied from the instrument at order
            creation time.

            Use this to convert raw integer prices to decimal (e.g., price /
            10^price_scale).
        fractionalQuantityScale:
          type: string
          format: int64
          description: >-
            The fractional quantity scale of the order, copied from the
            instrument at order creation time.

            Use this to convert raw integer quantities to decimal (e.g., qty /
            10^fractional_quantity_scale).
        priceToQuantityFilled:
          type: object
          additionalProperties:
            type: string
            format: int64
          description: >-
            Denotes the quantity filled at each price point over the life of the
            order.

            Key is the price, value is the quantity filled at that price.
        makerCommissionsBasisPoints:
          type: string
          title: The total basis points for maker commissions
        manualOrderIndicator:
          $ref: '#/components/schemas/v1ManualOrderIndicator'
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
    v1OrderState:
      type: string
      enum:
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
      description: OrderState denotes the current order state.
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