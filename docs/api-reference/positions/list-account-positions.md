> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# List account positions

> Lists all positions within an account



## OpenAPI

````yaml /institutional/oapi-schemas/positions-schema.json get /v1/positions
openapi: 3.0.3
info:
  title: Positions API
  version: v1.0.0
servers:
  - url: https://api.prod.polymarketexchange.com
    description: Production server
security:
  - bearerAuth: []
tags:
  - name: PositionAPI
paths:
  /v1/positions:
    get:
      tags:
        - Positions
      summary: List account positions
      description: Lists all positions within an account
      operationId: PositionAPI_ListAccountPositions
      parameters:
        - name: name
          description: |-
            Required. Fully qualified resource name of the account.
            Example: "firms/ISV-Alice/accounts/alice-trading-account"
          in: query
          required: false
          schema:
            type: string
        - name: symbol
          description: Symbol to filter (optional).
          in: query
          required: false
          schema:
            type: string
        - name: asOfTime
          description: |-
            Optional. Query positions as of this timestamp.
            If set, returns historical positions instead of current.
          in: query
          required: false
          schema:
            type: string
            format: date-time
        - name: asOfDate.year
          in: query
          required: false
          schema:
            type: integer
            format: int32
        - name: asOfDate.month
          in: query
          required: false
          schema:
            type: integer
            format: int32
            minimum: 1
            maximum: 12
        - name: asOfDate.day
          in: query
          required: false
          schema:
            type: integer
            format: int32
            minimum: 1
            maximum: 31
        - name: pageSize
          description: >-
            The maximum number of positions to return in one page. If 0/unset
            the

            server picks a default and may cap the value. Mirrors
            GetPositionLedgerRequest.
          in: query
          required: false
          schema:
            type: integer
            format: int32
        - name: pageToken
          description: >-
            Opaque continuation token from a prior

            ListAccountPositionsResponse.next_page_token. Empty for the first
            page.
          in: query
          required: false
          schema:
            type: string
        - name: activeOnly
          description: >-
            When true, expired positions are omitted. Default false preserves
            the

            current behavior (expired positions are included).
          in: query
          required: false
          schema:
            type: boolean
        - name: nonZeroOnly
          description: >-
            When true, positions with net_position == 0 are omitted
            (settled/closed

            markets that linger as zero-quantity rows). Default false preserves
            the

            current behavior (all positions are returned). Unlike active_only
            this is

            honored on historical (as_of) queries too, since net_position is
            always

            populated.
          in: query
          required: false
          schema:
            type: boolean
      responses:
        '200':
          description: A successful response.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/v1ListAccountPositionsResponse'
components:
  schemas:
    v1ListAccountPositionsResponse:
      type: object
      properties:
        positions:
          type: array
          items:
            $ref: '#/components/schemas/v1Position'
        availablePosition:
          type: array
          items:
            type: string
            format: int64
        nextPageToken:
          type: string
          description: >-
            Continuation token for the next page; empty when this is the last
            page.
        eof:
          type: boolean
          description: >-
            True when there are no more pages after this one. Mirrors
            GetPositionLedgerResponse.
      description: Response with account positions.
    v1Position:
      type: object
      properties:
        account:
          type: string
        symbol:
          type: string
        netPosition:
          type: string
          format: int64
        qtyBought:
          type: string
          format: int64
        qtySold:
          type: string
          format: int64
        cost:
          type: string
          format: int64
        realized:
          type: string
          format: int64
        bodPosition:
          type: string
          format: int64
        expired:
          type: boolean
        updateTime:
          type: string
          format: date-time
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

````