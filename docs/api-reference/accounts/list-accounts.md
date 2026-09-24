> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# List accounts

> Returns the accounts that the user may use to trade



## OpenAPI

````yaml /institutional/oapi-schemas/accounts-schema.json get /v1/accounts
openapi: 3.0.3
info:
  title: Accounts API
  version: v1.0.0
servers:
  - url: https://api.prod.polymarketexchange.com
    description: Production server
security:
  - bearerAuth: []
tags:
  - name: AccountsAPI
paths:
  /v1/accounts:
    get:
      tags:
        - Accounts
      summary: List accounts
      description: Returns the accounts that the user may use to trade
      operationId: AccountsAPI_ListAccounts
      parameters:
        - name: user
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
                $ref: '#/components/schemas/v1ListAccountsResponse'
components:
  schemas:
    v1ListAccountsResponse:
      type: object
      properties:
        accounts:
          type: array
          items:
            type: string
        displayNames:
          type: array
          items:
            type: string
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

````