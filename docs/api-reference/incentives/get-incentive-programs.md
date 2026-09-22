> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Incentive Programs

> Get incentive programs for each market. This endpoint is public and requires no authentication.



## OpenAPI

````yaml /institutional/oapi-schemas/incentives-schema.json get /v1/incentives
openapi: 3.0.1
info:
  title: Incentives API
  description: Incentive program and earnings endpoints
  version: v1.0.0
servers:
  - url: https://api.prod.polymarketexchange.com
security: []
tags:
  - name: Incentives
paths:
  /v1/incentives:
    get:
      tags:
        - Incentives
      summary: Get Incentive Programs
      description: >-
        Get incentive programs for each market. This endpoint is public and
        requires no authentication.
      operationId: IncentivesAPI_ListIncentives
      parameters:
        - name: pageSize
          in: query
          description: >-
            Number of markets to return per page. Use with `pageToken` for
            pagination. Example: `10`
          required: false
          schema:
            type: integer
            format: int32
        - name: pageToken
          in: query
          description: >-
            Pagination token from a previous response's `nextPageToken` field.
            Omit for the first request
          required: false
          schema:
            type: string
        - name: symbols
          in: query
          description: >-
            Filter by market symbols. Returns only programs for the specified
            markets. Example: `aec-nba-bos-nyk-2026-04-01`
          required: false
          schema:
            type: array
            items:
              type: string
        - name: orderBy
          in: query
          description: >-
            Field to sort results by. `created_at` sorts by program start time,
            `reward` sorts by reward pool size
          required: false
          schema:
            type: string
            enum:
              - created_at
        - name: orderDirection
          in: query
          description: 'Sort direction. Default: `desc`'
          required: false
          schema:
            type: string
            enum:
              - asc
              - desc
        - name: statuses
          in: query
          description: >-
            Filter by program status. Multiple values can be provided. Example:
            `statuses=active&statuses=pending`
          required: false
          schema:
            type: array
            items:
              type: string
              enum:
                - active
                - closed
                - pending
      responses:
        '200':
          description: List of incentive programs grouped by market
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ListIncentivesResponse'
components:
  schemas:
    ListIncentivesResponse:
      type: object
      properties:
        programs:
          type: array
          items:
            $ref: '#/components/schemas/IncentiveProgram'
          description: Incentive programs grouped by market
        nextPageToken:
          type: string
          description: Pagination token for next page. Empty if no more results
    IncentiveProgram:
      type: object
      properties:
        marketSlug:
          type: string
          description: Market identifier
        timePeriods:
          type: array
          items:
            $ref: '#/components/schemas/TimePeriod'
          description: Incentive time periods for this market
    TimePeriod:
      type: object
      properties:
        programId:
          type: string
          description: 'Unique identifier for this program period. Example: `nba_t1_ml_live`'
        programType:
          type: string
          description: 'Type of incentive program. Example: `liquidityProgram`'
        start:
          type: string
          format: date-time
          description: ISO 8601 start timestamp for this period
        end:
          type: string
          format: date-time
          description: >-
            ISO 8601 end timestamp for this period. Omitted when the final end
            time is not known yet, such as an in-progress live game.
        rewardPool:
          type: number
          format: double
          description: Total reward pool for this period in USD
        status:
          type: string
          enum:
            - active
            - closed
            - pending
          description: Current status of this period
        discountFactor:
          type: number
          format: double
          nullable: true
          description: >-
            Discount factor for scoring — controls how much orders further from
            the best price are penalized
        targetSize:
          type: integer
          format: int32
          nullable: true
          description: >-
            Minimum aggregate resting order size on a side of the book for that
            side to qualify
        period:
          type: string
          description: 'Reward period type. Example: `early`, `day_of`, `live`'
        createdAt:
          type: string
          format: date-time
          description: ISO 8601 timestamp when the program was created

````