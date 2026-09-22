> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Incentive Earnings

> Get incentive earnings for the authenticated user. Returns reward records grouped by market, date (Eastern Time), and payout status. Dates are bucketed by ET midnight boundaries.



## OpenAPI

````yaml /institutional/oapi-schemas/incentives-schema.json get /v1/incentives/earnings
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
  /v1/incentives/earnings:
    get:
      tags:
        - Incentives
      summary: Get Incentive Earnings
      description: >-
        Get incentive earnings for the authenticated user. Returns reward
        records grouped by market, date (Eastern Time), and payout status. Dates
        are bucketed by ET midnight boundaries.
      operationId: IncentivesAPI_GetIncentivesEarned
      parameters:
        - name: startDate
          in: query
          description: >-
            Start date filter in `YYYY-MM-DD` format. Defaults to `2026-03-21`
            (earliest available data). Example: `2026-03-25`
          required: false
          schema:
            type: string
            format: date
        - name: endDate
          in: query
          description: >-
            End date filter in `YYYY-MM-DD` format. Omit to include all dates
            after startDate. Example: `2026-03-31`
          required: false
          schema:
            type: string
            format: date
        - name: marketSlug
          in: query
          description: >-
            Filter earnings by a specific market. Example:
            `aec-nba-bos-nyk-2026-04-01`
          required: false
          schema:
            type: string
        - name: programType
          in: query
          description: 'Filter earnings by program type. Example: `liquidityProgram`'
          required: false
          schema:
            type: string
      responses:
        '200':
          description: User's incentive earnings
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/GetIncentivesEarnedResponse'
components:
  schemas:
    GetIncentivesEarnedResponse:
      type: object
      properties:
        rewards:
          type: array
          items:
            $ref: '#/components/schemas/UserReward'
          description: List of earned rewards
    UserReward:
      type: object
      properties:
        reward:
          type: number
          format: double
          description: >-
            Reward amount in USD (sum of payouts for this market and date with
            this status)
        programType:
          type: string
          description: 'Type of incentive program. Example: `liquidityProgram`'
        marketSlug:
          type: string
          description: Market identifier
        date:
          type: string
          format: date
          description: >-
            Reward date in Eastern Time (`YYYY-MM-DD`). Dates are bucketed by ET
            midnight boundaries.
        status:
          type: string
          enum:
            - PAID
            - PENDING
            - SKIPPED
          description: >-
            Payout disposition. A single marketSlug + date may appear once per
            status.

````