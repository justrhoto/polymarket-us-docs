> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Get RFQ user ID

> Returns the public RFQ user ID for the authenticated participant.



## OpenAPI

````yaml /institutional/oapi-schemas/rfqs-schema.json get /v1/rfqs/user-id
openapi: 3.0.3
info:
  title: RFQ API
  version: v1.0.0
servers:
  - url: https://api.prod.polymarketexchange.com
    description: Production server
security:
  - bearerAuth: []
tags:
  - name: RFQs
    description: Read and manage combo RFQs and quotes.
paths:
  /v1/rfqs/user-id:
    get:
      tags:
        - RFQs
      summary: Get RFQ user ID
      description: Returns the public RFQ user ID for the authenticated participant.
      operationId: RFQAPI_GetRFQUserID
      responses:
        '200':
          description: A successful response.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/v1GetRFQUserIDResponse'
components:
  schemas:
    v1GetRFQUserIDResponse:
      type: object
      properties:
        rfqUserId:
          type: string
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

````