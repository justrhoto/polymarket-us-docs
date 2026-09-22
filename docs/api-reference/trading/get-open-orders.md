> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Get open orders

> Returns a snapshot of working orders



## OpenAPI

````yaml /institutional/oapi-schemas/trading-schema.json get /v1/trading/orders/open
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
          schema:
            type: array
        - name: accounts
          in: query
          required: false
          schema:
            type: array
      responses:
        '200':
          description: A successful response.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/GetOpenOrdersResponse'
components:
  schemas:
    GetOpenOrdersResponse:
      type: object
      properties:
        orders:
          type: array
          items:
            $ref: '#/components/schemas/Order'
            type: object
    Order:
      type: object
      properties:
        id:
          type: string
          title: Exchange assigned ID for the order
        type:
          $ref: '#/components/schemas/OrderType'
        side:
          $ref: '#/components/schemas/Side'
        orderQty:
          type: string
          format: int64
        symbol:
          type: string
        clordId:
          type: string
          title: Client assigned ID for the order
        timeInForce:
          $ref: '#/components/schemas/TimeInForce'
          title: Absence of this field is interpreted as DAY
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
          $ref: '#/components/schemas/OrderState'
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
          $ref: '#/components/schemas/SelfMatchPreventionInstruction'
          title: If present, determines the behavior for order self match prevention
        orderCapacity:
          $ref: '#/components/schemas/OrderCapacity'
          title: If present, designates the order capacity
        ignorePriceValidityChecks:
          type: boolean
          title: A flag indicating order is exempt from price validity checks
        lastTransactTime:
          type: string
          format: date-time
          title: The most recent time this order was updated in any capacity
        makerCommissionsBasisPoints:
          type: string
          title: The total basis points for maker commissions
        manualOrderIndicator:
          $ref: '#/components/schemas/ManualOrderIndicator'
          title: If present, designates the manual order indicator
        fractionalQuantityScale:
          type: string
          format: int64
          title: >-
            Fractional quantity scale, copied from the instrument at order
            creation time. Divide raw integer quantities by this value for
            proper scale.
        priceToQuantityFilled:
          type: object
          additionalProperties:
            type: string
            format: int64
          title: >-
            Quantity filled at each price point over the life of the order. Key
            is the price, value is the quantity filled at that price.
    OrderType:
      type: string
      enum:
        - ORDER_TYPE_MARKET_TO_LIMIT
        - ORDER_TYPE_LIMIT
        - ORDER_TYPE_STOP
        - ORDER_TYPE_STOP_LIMIT
      description: OrderType indicates the type of an order.
    Side:
      type: string
      enum:
        - SIDE_BUY
        - SIDE_SELL
      description: Side indicates the side of an Order.
    TimeInForce:
      type: string
      enum:
        - TIME_IN_FORCE_DAY
        - TIME_IN_FORCE_GOOD_TILL_CANCEL
        - TIME_IN_FORCE_IMMEDIATE_OR_CANCEL
        - TIME_IN_FORCE_GOOD_TILL_TIME
        - TIME_IN_FORCE_FILL_OR_KILL
      description: TimeInForce specifies how long the order remains in effect.
    OrderState:
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
    SelfMatchPreventionInstruction:
      type: string
      enum:
        - SELF_MATCH_PREVENTION_INSTRUCTION_REJECT_AGGRESSOR
        - SELF_MATCH_PREVENTION_INSTRUCTION_CANCEL_RESTING
        - SELF_MATCH_PREVENTION_INSTRUCTION_REMOVE_BOTH
      description: >-
        SelfMatchPreventionInstruction is the methodology used to handle self
        match prevention.
    OrderCapacity:
      type: string
      enum:
        - ORDER_CAPACITY_AGENCY
        - ORDER_CAPACITY_PRINCIPAL
        - ORDER_CAPACITY_PROPRIETARY
        - ORDER_CAPACITY_INDIVIDUAL
        - ORDER_CAPACITY_RISKLESS_PRINCIPAL
        - ORDER_CAPACITY_AGENT_FOR_OTHER_MEMBER
      description: OrderCapacity designates the capacity of the party placing an order.
    ManualOrderIndicator:
      type: string
      enum:
        - MANUAL_ORDER_INDICATOR_MANUAL
        - MANUAL_ORDER_INDICATOR_AUTOMATED
      description: >-
        ManualOrderIndicator designates the manual or automated nature of an
        order.

````