> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# List instruments

> Returns a list of instruments matching the request



## OpenAPI

````yaml /institutional/oapi-schemas/refdata-schema.json post /v1/refdata/instruments
openapi: 3.0.3
info:
  title: Refdata API
  version: v1.0.0
servers:
  - url: https://api.prod.polymarketexchange.com
    description: Production server
security:
  - bearerAuth: []
tags:
  - name: RefDataAPI
paths:
  /v1/refdata/instruments:
    post:
      tags:
        - ReferenceData
      summary: List instruments
      description: Returns a list of instruments matching the request
      operationId: RefDataAPI_ListInstruments
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/v1ListInstrumentsRequest'
        description: Request for listing instruments.
        required: true
      responses:
        '200':
          description: A successful response.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/v1ListInstrumentsResponse'
components:
  schemas:
    v1ListInstrumentsRequest:
      type: object
      properties:
        pageSize:
          type: integer
          format: int32
          title: '=== Pagination ==='
          description: 'Results per page (default: 50, max: 1000)'
        pageToken:
          type: string
          description: Pagination cursor from previous response
        symbols:
          type: array
          items:
            type: string
          title: '=== Existing filters (backwards compatible) ==='
          description: Filter by specific instrument symbols
        productId:
          type: string
          description: Filter by product ID
        tradableFilter:
          $ref: '#/components/schemas/v1TradableFilter'
          description: Filter tradable vs non-tradable instruments
        states:
          type: array
          items:
            $ref: '#/components/schemas/v1InstrumentState'
          description: Filter by instrument states (e.g., INSTRUMENT_STATE_OPEN)
        type:
          $ref: '#/components/schemas/v1InstrumentType'
        eventSeries:
          type: string
          description: >-
            Filter by event series (e.g., "cbb", "nfl", "nba").

            Matches instruments where metadata["event_series"] equals this
            value.
        marketCategory:
          type: string
          description: Filter by market category (e.g., "sports", "politics", "crypto").
        marketType:
          type: string
          description: Filter by market type (e.g., "moneyline", "spread", "over_under").
        gameId:
          type: string
          description: Filter by game ID (provider-specific game identifier).
        clearingSym:
          type: string
          description: Filter by clearing symbol prefix (e.g., "AEC-NFL", "AEC-NBA").
        eventCategory:
          type: string
          description: >-
            Filter by event category (e.g., "SPR" for sports, "POL" for
            politics).

            Matches instruments where metadata["event_category"] equals this
            value.
        startTimeGte:
          type: string
          description: >-
            Filter instruments with start_date >= this value (format:
            "2025-01-01" or timestamp).

            Returns instruments that start on or after this date.
        startTimeLte:
          type: string
          description: >-
            Filter instruments with start_date <= this value (format:
            "2025-01-01" or timestamp).

            Returns instruments that start on or before this date.
        endTimeGte:
          type: string
          description: >-
            Filter instruments with expiration_date >= this value (format:
            "2025-01-01" or timestamp).

            Returns instruments that expire on or after this date.
        endTimeLte:
          type: string
          description: >-
            Filter instruments with expiration_date <= this value (format:
            "2025-01-01" or timestamp).

            Returns instruments that expire on or before this date.
        filter:
          $ref: '#/components/schemas/v1InstrumentFilter'
          description: >-
            Advanced filter with whereClause and/or fieldFilters (ANDed together
            if both provided)
      description: Request for listing instruments.
    v1ListInstrumentsResponse:
      type: object
      properties:
        instruments:
          type: array
          items:
            $ref: '#/components/schemas/v1Instrument'
          description: List of matching instruments
        nextPageToken:
          type: string
          description: Token for fetching next page (empty if no more results)
        eof:
          type: boolean
          description: True when no more results available
      description: Response with list of instruments.
    v1TradableFilter:
      type: string
      enum:
        - TRADABLE_FILTER_NON_TRADABLE
        - TRADABLE_FILTER_TRADABLE
      description: TradableFilter for filtering instruments by tradability.
    v1InstrumentState:
      type: string
      enum:
        - INSTRUMENT_STATE_OPEN
        - INSTRUMENT_STATE_PREOPEN
        - INSTRUMENT_STATE_SUSPENDED
        - INSTRUMENT_STATE_EXPIRED
        - INSTRUMENT_STATE_TERMINATED
        - INSTRUMENT_STATE_HALTED
        - INSTRUMENT_STATE_MATCH_AND_CLOSE_AUCTION
        - INSTRUMENT_STATE_PENDING
      description: >-
        **PENDING**: Initial state for a newly created instrument which has not
        yet begun trading.


        **CLOSED**: No order entry, modification, cancellation, or matching. Day
        orders expired.


        **OPEN**: Continuous order entry and matching.


        **PREOPEN**: Orders accepted, no matching. Dutch Auction on transition
        to OPEN.


        **MATCH_AND_CLOSE_AUCTION**: Like PREOPEN, matches on transition out.


        **SUSPENDED**: Cancel only. No entry, modification, or matching.


        **HALTED**: Like SUSPENDED, no cancels allowed.


        **EXPIRED**: All resting orders expired, no new orders.


        **TERMINATED**: Order book removed, all orders and positions closed.
    v1InstrumentType:
      type: string
      enum:
        - INSTRUMENT_TYPE_DEFAULT
        - INSTRUMENT_TYPE_FUTURE
        - INSTRUMENT_TYPE_OPTION
        - INSTRUMENT_TYPE_MULTILEG
        - INSTRUMENT_TYPE_IRS
        - INSTRUMENT_TYPE_FRA
        - INSTRUMENT_TYPE_FSIRS
        - INSTRUMENT_TYPE_BASIS
        - INSTRUMENT_TYPE_EVENT
        - INSTRUMENT_TYPE_OIS
        - INSTRUMENT_TYPE_SPS
        - INSTRUMENT_TYPE_NDF
        - INSTRUMENT_TYPE_FOREX
        - INSTRUMENT_TYPE_ZCIS
        - INSTRUMENT_TYPE_XCCY
      description: InstrumentType represents the type of instrument.
    v1InstrumentFilter:
      type: object
      properties:
        whereClause:
          type: string
          title: >-
            SQL WHERE clause fragment (without the WHERE keyword).

            Allowed operators: =, !=, <, <=, >, >=, LIKE, IN, AND, OR, NOT

            Allowed columns: symbol, state, product_id, event_series,
            event_category, market_category,
             market_type, game_id, clearing_sym, start_date, expiration_date,
             event_id, event_question, event_outcome, non_tradable, tick_size
            Example: "symbol LIKE 'aec-nfl-%' AND state =
            'INSTRUMENT_STATE_OPEN'"
          description: >-
            SQL-like string expression. Supported operators: =, LIKE (with %
            wildcard), AND. Supported columns: state, symbol, event_series,
            event_category, clearing_sym, clearing_house, product_id. Do NOT use
            instrument_product, outcome_type, or event_subcategory (causes HTTP
            500).
        fieldFilters:
          type: array
          items:
            $ref: '#/components/schemas/v1FieldFilter'
          description: >-
            Structured type-safe filters (ANDed with where_clause if both
            provided).
      description: InstrumentFilter for advanced queries.
    v1Instrument:
      type: object
      properties:
        symbol:
          type: string
        tickSize:
          type: number
          format: double
        baseCurrency:
          type: string
        multiplier:
          type: number
          format: double
        minimumTradeQty:
          type: string
          format: int64
        startDate:
          $ref: '#/components/schemas/v1Date'
        expirationDate:
          $ref: '#/components/schemas/v1Date'
        terminationDate:
          $ref: '#/components/schemas/v1Date'
        tradingSchedule:
          type: array
          items:
            $ref: '#/components/schemas/v1TradingHours'
        description:
          type: string
        clearingHouse:
          type: string
        minimumUnaffiliatedFirms:
          type: string
          format: int64
        nonTradable:
          type: boolean
          title: type_attributes omitted - complex oneof with many swap types
        jsonAttributes:
          type: string
        productId:
          type: string
        priceLimit:
          $ref: '#/components/schemas/v1PriceLimit'
        orderSizeLimit:
          $ref: '#/components/schemas/v1OrderSizeLimit'
        expirationTime:
          $ref: '#/components/schemas/v1TimeOfDay'
        tradeSettlementPeriod:
          type: string
          format: int64
        state:
          $ref: '#/components/schemas/v1InstrumentState'
        priceScale:
          type: string
          format: int64
        fractionalQtyScale:
          type: string
          format: int64
        settlementCurrency:
          type: string
        settlementPriceScale:
          type: string
          format: int64
        metadata:
          type: object
          additionalProperties:
            type: string
          description: >-
            Per-instrument metadata from the exchange Attributes.Metadata map.

            Contains sports metadata like game_id, team abbreviations, league,
            etc.
        eventAttributes:
          $ref: '#/components/schemas/v1EventAttributes'
        createTime:
          type: string
          format: date-time
          description: Creation timestamp of the instrument.
        updateTime:
          type: string
          format: date-time
          description: Last update timestamp of the instrument.
      description: Instrument represents a tradable instrument.
    v1FieldFilter:
      type: object
      properties:
        field:
          type: string
          description: Column name to filter on.
        operator:
          $ref: '#/components/schemas/v1FilterOperator'
          description: Comparison operator
        stringValue:
          type: string
          description: String value to compare against (for EQ, LIKE)
        intValue:
          type: string
          format: int64
        doubleValue:
          type: number
          format: double
        stringList:
          $ref: '#/components/schemas/v1StringList'
          description: List of string values (for IN operator)
      description: FieldFilter for structured filtering.
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
    v1TradingHours:
      type: object
      properties:
        daysOfWeek:
          type: array
          items:
            type: integer
            format: int32
        timeOfDay:
          $ref: '#/components/schemas/v1TimeOfDay'
        duration:
          type: string
        state:
          $ref: '#/components/schemas/v1InstrumentState'
        hideMarketData:
          type: boolean
        expireAllOrders:
          type: boolean
      description: TradingHours describes an instrument trading schedule segment.
    v1PriceLimit:
      type: object
      properties:
        low:
          type: string
          format: int64
        high:
          type: string
          format: int64
        lowSet:
          type: boolean
        highSet:
          type: boolean
        relativeLow:
          type: number
          format: double
        relativeHigh:
          type: number
          format: double
        relativeLowSet:
          type: boolean
        relativeHighSet:
          type: boolean
      description: PriceLimit describes optional price limits on an instrument.
    v1OrderSizeLimit:
      type: object
      properties:
        low:
          type: string
          format: int64
        high:
          type: string
          format: int64
        lowSet:
          type: boolean
        highSet:
          type: boolean
        totalNotionalLow:
          type: string
          format: int64
        totalNotionalHigh:
          type: string
          format: int64
        totalNotionalLowSet:
          type: boolean
        totalNotionalHighSet:
          type: boolean
      description: OrderSizeLimit describes optional order size limits on an instrument.
    v1TimeOfDay:
      type: object
      properties:
        hours:
          type: integer
          format: int32
        minutes:
          type: integer
          format: int32
        seconds:
          type: integer
          format: int32
      description: TimeOfDay represents a time of day.
    v1EventAttributes:
      type: object
      properties:
        question:
          type: string
          description: The question or description of the event outcome.
        payoutValue:
          type: string
          description: The payout value when the event resolves (e.g., "1000").
        evaluationType:
          type: string
          description: The evaluation type for resolution (e.g., ">", "<", "=").
        eventId:
          type: string
          description: Unique event identifier.
        eventDisplayName:
          type: string
          description: Human-readable display name for the event.
        strikeValue:
          type: string
          description: Strike value for evaluation.
        strikeUnit:
          type: string
          description: Unit for strike value (e.g., "decimal", "percentage").
        calculationMethod:
          type: string
          description: Calculation method for settlement.
        positionAccountabilityValue:
          type: string
          description: Position accountability limit value.
        timeSpecifier:
          $ref: '#/components/schemas/v1Date'
          description: Time specifier for the event
        eventOutcome:
          type: string
          description: >-
            The relationship of instrument outcomes within the event:

            "EVENT_OUTCOME_MUTUALLY_EXCLUSIVE" (exactly one instrument in the
            event resolves YES),

            "EVENT_OUTCOME_DIRECTIONAL" (instruments are strike-ranked; YES at
            one strike implies

            YES for in-the-money strikes), or "EVENT_OUTCOME_INDEPENDENT" (each
            instrument resolves

            on its own; also the default when the exchange has not set an
            outcome type).
      description: EventAttributes contains event-specific instrument attributes.
    v1FilterOperator:
      type: string
      enum:
        - FILTER_OPERATOR_EQ
        - FILTER_OPERATOR_NE
        - FILTER_OPERATOR_LT
        - FILTER_OPERATOR_LE
        - FILTER_OPERATOR_GT
        - FILTER_OPERATOR_GE
        - FILTER_OPERATOR_LIKE
        - FILTER_OPERATOR_IN
        - FILTER_OPERATOR_NOT_IN
      description: |-
        FilterOperator defines comparison operators for FieldFilter.

         - FILTER_OPERATOR_EQ: =
         - FILTER_OPERATOR_NE: !=
         - FILTER_OPERATOR_LT: <
         - FILTER_OPERATOR_LE: <=
         - FILTER_OPERATOR_GT: >
         - FILTER_OPERATOR_GE: >=
         - FILTER_OPERATOR_LIKE: LIKE (SQL pattern with % and _ wildcards)
         - FILTER_OPERATOR_IN: IN (list)
         - FILTER_OPERATOR_NOT_IN: NOT IN (list)
    v1StringList:
      type: object
      properties:
        values:
          type: array
          items:
            type: string
          description: List of string values
      description: StringList for IN/NOT IN operators.
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

````