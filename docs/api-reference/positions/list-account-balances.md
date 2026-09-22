> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# List account balances

> Lists all currency balances in an account



## OpenAPI

````yaml /institutional/oapi-schemas/positions-schema.json post /v1/positions/balances
openapi: 3.0.1
info:
  title: Positions API
  version: v1.0.0
servers:
  - url: https://api.prod.polymarketexchange.com
security: []
tags:
  - name: PositionAPI
paths:
  /v1/positions/balances:
    post:
      tags:
        - Positions
      summary: List account balances
      description: Lists all currency balances in an account
      operationId: PositionAPI_ListAccountBalances
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ListAccountBalancesRequest'
        required: true
      responses:
        '200':
          description: A successful response.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ListAccountBalancesResponse'
components:
  schemas:
    ListAccountBalancesRequest:
      type: object
      properties:
        name:
          type: string
          description: Fully qualified resource name of the account.
      description: Request to list all balances in an account.
    ListAccountBalancesResponse:
      type: object
      properties:
        balances:
          type: object
          additionalProperties:
            $ref: '#/components/schemas/GetAccountBalanceResponse'
      description: Response with all account balances by currency.
    GetAccountBalanceResponse:
      type: object
      properties:
        balance:
          type: string
        capitalRequirement:
          type: string
        excessCapital:
          type: string
        buyingPower:
          type: string
        securities:
          type: object
          additionalProperties:
            $ref: '#/components/schemas/SecurityEntry'
        totalSecurityNotionalValue:
          type: string
        totalSecurityAvailableValue:
          type: string
        openOrders:
          type: string
        alternateCapitalRequirementCurrency:
          type: string
        alternateCapitalRequirement:
          type: string
        unsettledFunds:
          type: string
        marginRequirement:
          type: string
        updateTime:
          type: string
          format: date-time
      description: Response with account balance details.
    SecurityEntry:
      type: object
      properties:
        balance:
          type: string
        marketValue:
          type: string
        haircut:
          type: string
          format: int64
        notionalValue:
          type: string
        availableValue:
          type: string
      description: SecurityEntry describes the valuation of a security.

````