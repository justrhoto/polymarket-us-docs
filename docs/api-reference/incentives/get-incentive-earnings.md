> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Incentive Earnings

> Returns incentive earnings for the participant identified by request metadata.



## OpenAPI

````yaml /institutional/oapi-schemas/incentives-schema.json get /v1/incentives/earnings
openapi: 3.0.3
info:
  title: Incentives API
  version: v1.0.0
servers:
  - url: https://api.prod.polymarketexchange.com
    description: Production server
security:
  - bearerAuth: []
tags:
  - name: Incentives
paths:
  /v1/incentives/earnings:
    get:
      tags:
        - Incentives
      summary: Get Incentive Earnings
      description: >-
        Returns incentive earnings for the participant identified by request
        metadata.
      operationId: IncentivesAPI_GetIncentivesEarned
      parameters:
        - name: startDate
          description: >-
            Start date filter in `YYYY-MM-DD` format. Defaults to `2026-03-21`
            (earliest available data). Example: `2026-03-25`
          in: query
          required: false
          schema:
            type: string
        - name: endDate
          description: >-
            End date filter in `YYYY-MM-DD` format. Omit to include all dates
            after startDate. Example: `2026-03-31`
          in: query
          required: false
          schema:
            type: string
        - name: marketSlug
          description: >-
            Filter earnings by a specific market. Example:
            `aec-nba-bos-nyk-2026-04-01`
          in: query
          required: false
          schema:
            type: string
        - name: programType
          description: filter by program type (optional, e.g. "liquidityProgram")
          in: query
          required: false
          schema:
            type: string
      responses:
        '200':
          description: A successful response.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/v1GetIncentivesEarnedResponse'
components:
  schemas:
    v1GetIncentivesEarnedResponse:
      type: object
      properties:
        rewards:
          type: array
          items:
            $ref: '#/components/schemas/v1UserReward'
          description: List of earned rewards
    v1UserReward:
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
          title: e.g. "liquidityProgram"
          description: 'Type of incentive program. Example: `liquidityProgram`'
        marketSlug:
          type: string
          description: Market identifier
        date:
          type: string
          title: YYYY-MM-DD
          description: >-
            Reward date in Eastern Time (`YYYY-MM-DD`). Dates are bucketed by ET
            midnight boundaries.
        status:
          type: string
          title: 'payout disposition: "PAID" | "PENDING" | "SKIPPED"'
          enum:
            - PAID
            - PENDING
            - SKIPPED
          description: >-
            Payout disposition. A single marketSlug + date may appear once per
            status.
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

````