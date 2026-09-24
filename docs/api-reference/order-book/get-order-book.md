> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Get order book

> Returns the current aggregated order book for a symbol



## OpenAPI

````yaml /institutional/oapi-schemas/orderbook-schema.json get /v1/orderbook/{symbol}
openapi: 3.0.3
info:
  title: Order Book API
  version: v1.0.0
servers:
  - url: https://api.prod.polymarketexchange.com
    description: Production server
security:
  - bearerAuth: []
tags:
  - name: OrderBookAPI
paths:
  /v1/orderbook/{symbol}:
    get:
      tags:
        - Order Book
      summary: Get order book
      description: Returns the current aggregated order book for a symbol
      operationId: OrderBookAPI_GetOrderBook
      parameters:
        - name: symbol
          description: Instrument symbol (e.g., "BTC-USD")
          in: path
          required: true
          schema:
            type: string
        - name: depth
          description: Number of price levels to return (default 3, max 10)
          in: query
          required: false
          schema:
            type: integer
            format: int32
      responses:
        '200':
          description: A successful response.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/v1GetOrderBookResponse'
components:
  schemas:
    v1GetOrderBookResponse:
      type: object
      properties:
        symbol:
          type: string
          title: Instrument symbol
        bids:
          type: array
          items:
            $ref: '#/components/schemas/v1BookEntry'
          title: Bid side of order book (sorted by price descending)
        offers:
          type: array
          items:
            $ref: '#/components/schemas/v1BookEntry'
          title: Offer/ask side of order book (sorted by price ascending)
        state:
          $ref: '#/components/schemas/v1InstrumentState'
        stats:
          $ref: '#/components/schemas/v1InstrumentStats'
        transactTime:
          type: string
          format: date-time
          title: Server timestamp of the data
      description: Response containing the order book snapshot.
    v1BookEntry:
      type: object
      properties:
        px:
          type: string
          format: int64
        qty:
          type: string
          format: int64
      description: BookEntry lists a price and volume for a market data record.
      x-deprecated-removed: symbolSubType field was intentionally removed - do not add it back
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
      description: InstrumentState represents the state of an instrument.
    v1InstrumentStats:
      type: object
      properties:
        openPx:
          type: string
          format: int64
          nullable: true
        closePx:
          type: string
          format: int64
          nullable: true
        lowPx:
          type: string
          format: int64
          nullable: true
        highPx:
          type: string
          format: int64
          nullable: true
        lastTradePx:
          type: string
          format: int64
          nullable: true
          description: Last trade price.
        indicativeOpenPx:
          type: string
          format: int64
          nullable: true
        settlementPx:
          type: string
          format: int64
          nullable: true
        sharesTraded:
          type: string
          format: int64
          nullable: true
        notionalTraded:
          type: string
          format: int64
          nullable: true
        openInterest:
          type: string
          format: int64
          nullable: true
        settlementPreliminary:
          type: boolean
          description: >-
            Settlement metadata — only populated when instrument is in a settled
            state (CLOSED, TERMINATED, EXPIRED).

            Indicates whether this settlement is preliminary (subject to change
            during trade day sweep) or final.
          nullable: true
        settlementPriceCalculationMethod:
          type: string
          description: >-
            The method used to calculate the settlement price (e.g.,
            "SETTLEMENT_PRICE_CALCULATION_METHOD_EVENT_TIER_1").

            String representation for forward compatibility with new enum
            values.
          nullable: true
        settlementPriceCalculationText:
          type: string
          description: >-
            Free-form text describing how the settlement price was determined

            (e.g., the exact outcome of the underlying event used for
            resolution).
          nullable: true
        lastTradeQty:
          type: string
          format: int64
          description: Quantity of the most recent trade.
          nullable: true
        settlementSetTime:
          type: string
          format: date-time
          description: >-
            Time at which the settlement price was set. Only populated for
            settled states.
          nullable: true
      description: InstrumentStats contains statistics about an instrument.
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

````