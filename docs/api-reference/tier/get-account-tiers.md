> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Get account tiers

> Read the maker fee tier and the taker fee tier of an account. Requires a bearer token with read:accounts scope; no x-participant-id header is needed. Returns 400 when account is missing or is not a valid account name, and 403 when the caller is not permitted to trade the account, also for an account that does not exist.



## OpenAPI

````yaml /institutional/oapi-schemas/tier-schema.json get /v1/tier/account-tiers
openapi: 3.0.3
info:
  title: Tier API
  version: v1.0.0
servers:
  - url: https://api.prod.polymarketexchange.com
    description: Production server
security:
  - bearerAuth: []
tags:
  - name: TierAPI
paths:
  /v1/tier/account-tiers:
    get:
      tags:
        - Tier
      summary: Get account tiers
      description: >-
        Read the maker fee tier and the taker fee tier of an account. Requires a
        bearer token with read:accounts scope; no x-participant-id header is
        needed. Returns 400 when account is missing or is not a valid account
        name, and 403 when the caller is not permitted to trade the account,
        also for an account that does not exist.
      operationId: TierAPI_GetAccountTiers
      parameters:
        - name: account
          description: >-
            Fully qualified account name, for example
            `firms/YOUR_FIRM/accounts/YOUR_ACCOUNT`.
          in: query
          required: true
          schema:
            type: string
          example: firms/YOUR_FIRM/accounts/YOUR_ACCOUNT
      responses:
        '200':
          description: A successful response.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/v1GetAccountTiersResponse'
components:
  schemas:
    v1GetAccountTiersResponse:
      type: object
      properties:
        makerTier:
          type: integer
          format: int64
          description: >-
            Maker fee tier of the account, from 1 to 9. Tier 1 is the default
            tier.
        takerTier:
          type: integer
          format: int64
          description: >-
            Taker fee tier of the account, from 1 to 9. Tier 1 is the default
            tier.
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

````

This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.