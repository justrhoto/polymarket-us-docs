> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Get who am I

> Returns the user information of the caller



## OpenAPI

````yaml /institutional/oapi-schemas/accounts-schema.json get /v1/whoami
openapi: 3.0.1
info:
  title: Accounts API
  version: v1.0.0
servers:
  - url: https://api.prod.polymarketexchange.com
security: []
tags:
  - name: AccountsAPI
paths:
  /v1/whoami:
    get:
      tags:
        - Accounts
      summary: Get who am I
      description: Returns the user information of the caller
      operationId: AccountsAPI_GetWhoAmI
      responses:
        '200':
          description: A successful response.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/GetWhoAmIResponse'
components:
  schemas:
    GetWhoAmIResponse:
      type: object
      properties:
        user:
          type: string
        userDisplayName:
          type: string
        firm:
          type: string
        firmDisplayName:
          type: string
        audience:
          type: string
        firmType:
          $ref: '#/components/schemas/FirmType'
    FirmType:
      type: string
      enum:
        - FIRM_TYPE_PARTICIPANT
        - FIRM_TYPE_SUPERVISOR
        - FIRM_TYPE_CLEARING_MEMBER
        - FIRM_TYPE_CLEARING_HOUSE
        - FIRM_TYPE_AGENT
      description: |-
        FirmType indicates the type of firm.
        Matches Connamara firms.v1beta1.FirmType for wire compatibility.

````