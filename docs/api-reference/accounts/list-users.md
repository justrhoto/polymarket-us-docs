> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# List users

> Returns the users that the caller may trade on behalf of



## OpenAPI

````yaml /institutional/oapi-schemas/accounts-schema.json get /v1/users
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
  /v1/users:
    get:
      tags:
        - Accounts
      summary: List users
      description: Returns the users that the caller may trade on behalf of
      operationId: UsersAPI_ListUsers
      responses:
        '200':
          description: A successful response.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/v1ListUsersResponse'
components:
  schemas:
    v1ListUsersResponse:
      type: object
      properties:
        users:
          type: array
          items:
            type: string
        displayNames:
          type: array
          items:
            type: string
        firms:
          type: array
          items:
            type: string
        firmsDisplayNames:
          type: array
          items:
            type: string
      title: >-
        ListUsersResponse - List of exchange participant names (migrated from
        AccountsAPI)
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

````