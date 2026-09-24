> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Search trades

> Searches for exchange trades using the given details to filter



## OpenAPI

````yaml /institutional/oapi-schemas/report-schema.json post /v1/report/trades/search
openapi: 3.0.3
info:
  title: Report API
  version: v1.0.0
servers:
  - url: https://api.prod.polymarketexchange.com
    description: Production server
security:
  - bearerAuth: []
tags:
  - name: ReportAPI
paths:
  /v1/report/trades/search:
    post:
      tags:
        - Report
      summary: Search trades
      description: Searches for exchange trades using the given details to filter
      operationId: ReportAPI_SearchTrades
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/v1SearchTradesRequest'
        required: true
      responses:
        '200':
          description: A successful response.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/v1SearchTradesResponse'
components:
  schemas:
    v1SearchTradesRequest:
      type: object
      properties:
        pageSize:
          type: integer
          format: int32
        pageToken:
          type: string
        orderId:
          type: string
        tradeId:
          type: string
        execId:
          type: string
        startTime:
          type: string
          format: date-time
        endTime:
          type: string
          format: date-time
        symbol:
          type: string
        accounts:
          type: array
          items:
            type: string
        states:
          type: array
          items:
            $ref: '#/components/schemas/v1TradeState'
        tradeLinkId:
          type: string
    v1SearchTradesResponse:
      type: object
      properties:
        trade:
          type: array
          items:
            $ref: '#/components/schemas/v1Trade'
        nextPageToken:
          type: string
    v1TradeState:
      type: string
      enum:
        - TRADE_STATE_NEW
        - TRADE_STATE_CLEARED
        - TRADE_STATE_BUSTED
        - TRADE_STATE_INFLIGHT
        - TRADE_STATE_PENDING_RISK
        - TRADE_STATE_PENDING_CLEARED
        - TRADE_STATE_REJECTED
        - TRADE_STATE_CLEARING_ACKNOWLEDGED
        - TRADE_STATE_RETRY_REQUEST
      description: TradeState indicates the state of a trade.
    v1Trade:
      type: object
      properties:
        id:
          type: string
          title: Exchange assigned ID for this trade
        aggressor:
          $ref: '#/components/schemas/v1Execution'
        passive:
          $ref: '#/components/schemas/v1Execution'
        tradeType:
          $ref: '#/components/schemas/v1TradeType'
        state:
          $ref: '#/components/schemas/v1TradeState'
        reportingCounterparty:
          $ref: '#/components/schemas/v1Side'
        text:
          type: string
          description: Additional detail regarding the status of the trade. May be empty.
        tradeLinkId:
          type: string
          description: >-
            Exchange assigned ID for a group of trades that all executed within
            the same underlying transactional event.
        metadata:
          type: object
          additionalProperties:
            type: string
          description: Metadata attached to this trade.
      description: |-
        Trade is an execution grouping reflecting a trade between two orders.
        Wire-compatible with the exchange Trade (from v1beta1/api.proto).
    v1Execution:
      type: object
      properties:
        id:
          type: string
          title: Exchange assigned ID for this execution
        order:
          $ref: '#/components/schemas/v1Order'
        lastShares:
          type: string
          format: int64
        lastPx:
          type: string
          format: int64
        type:
          $ref: '#/components/schemas/v1ExecutionType'
        text:
          type: string
          title: Free format text
        orderRejectReason:
          $ref: '#/components/schemas/v1OrdRejectReason'
        transactTime:
          type: string
          format: date-time
        legPrices:
          type: array
          items:
            $ref: '#/components/schemas/v1LegPrice'
          title: If a fill on a multi leg instrument, contains the derived leg prices
        tradeId:
          type: string
          title: If a fill, the trade id for this transaction
        aggressor:
          type: boolean
          title: If a fill, true if this execution belongs to aggressor order
        commissionNotionalCollected:
          type: string
          format: int64
          title: The notional value of commissions collected as part of the execution
        unsolicitedCancelReason:
          $ref: '#/components/schemas/v1UnsolicitedCxlReason'
        traceId:
          type: string
          title: If present, contains the exchange trace identifier
        commissionSpreadPx:
          type: string
          format: int64
          title: The price at which a commission spread order filled at
        transactTradeDate:
          $ref: '#/components/schemas/v1Date'
        blockTradeIndicator:
          type: boolean
          description: >-
            If a fill, true when the execution belongs to a block trade (a
            large,

            privately negotiated trade executed away from the order book). Lets

            drop-copy consumers recognize block fills directly instead of
            joining

            to the trade via trade_id or misreading them as order-book activity.
      description: Execution denotes a state change for an order in the exchange.
    v1TradeType:
      type: string
      enum:
        - TRADE_TYPE_REGULAR
        - TRADE_TYPE_REQUEST_FOR_QUOTE
        - TRADE_TYPE_BLOCK
        - TRADE_TYPE_CROSS
      description: TradeType describes the execution type of the trade.
    v1Side:
      type: string
      enum:
        - SIDE_BUY
        - SIDE_SELL
      description: Side indicates the side of an Order.
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
    v1ExecutionType:
      type: string
      enum:
        - EXECUTION_TYPE_PARTIAL_FILL
        - EXECUTION_TYPE_FILL
        - EXECUTION_TYPE_CANCELED
        - EXECUTION_TYPE_REPLACE
        - EXECUTION_TYPE_REJECTED
        - EXECUTION_TYPE_EXPIRED
        - EXECUTION_TYPE_DONE_FOR_DAY
      description: ExecutionType denotes the execution type.
    v1OrdRejectReason:
      type: string
      enum:
        - ORD_REJECT_REASON_UNKNOWN_SYMBOL
        - ORD_REJECT_REASON_EXCHANGE_CLOSED
        - ORD_REJECT_REASON_INCORRECT_QUANTITY
        - ORD_REJECT_REASON_INVALID_PRICE_INCREMENT
        - ORD_REJECT_REASON_INCORRECT_ORDER_TYPE
        - ORD_REJECT_REASON_PRICE_OUT_OF_BOUNDS
        - ORD_REJECT_REASON_NO_LIQUIDITY
      description: OrdRejectReason is the code to identify reason for order rejection.
    v1LegPrice:
      type: object
      properties:
        symbol:
          type: string
          title: The symbol of the leg
        anchor:
          type: boolean
          title: Indicates that this entry is used as the anchor price
        px:
          type: string
          format: int64
          title: The price of the leg
        qty:
          type: string
          format: int64
          title: The quantity of the leg
        side:
          type: string
          title: The side of the leg
        referencePx:
          type: string
          format: int64
          title: >-
            The reference price of the leg used in the calculation of the
            derived price
      description: LegPrice indicates a price for a leg as part of a multi leg instrument.
    v1UnsolicitedCxlReason:
      type: string
      enum:
        - UNSOLICITED_CXL_REASON_CONNECTION_LOSS
        - UNSOLICITED_CXL_REASON_LOGOUT
        - UNSOLICITED_CXL_REASON_EXCHANGE_OPTION
        - UNSOLICITED_CXL_REASON_OTHER
      description: >-
        UnsolicitedCxlReason is a code to identify the reason for an unsolicited
        cancellation.
    v1Date:
      type: object
      properties:
        year:
          type: integer
          format: int32
        month:
          type: integer
          format: int32
        day:
          type: integer
          format: int32
      description: Date represents a calendar date.
    v1OrderType:
      type: string
      enum:
        - ORDER_TYPE_MARKET_TO_LIMIT
        - ORDER_TYPE_LIMIT
        - ORDER_TYPE_STOP
        - ORDER_TYPE_STOP_LIMIT
      description: OrderType indicates the type of an order.
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