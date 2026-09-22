> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Create RFQ

> Creates a combo RFQ.



## OpenAPI

````yaml /institutional/oapi-schemas/rfqs-schema.json post /v1/rfqs
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
  /v1/rfqs:
    post:
      tags:
        - RFQs
      summary: Create RFQ
      description: Creates a combo RFQ.
      operationId: RFQAPI_CreateRFQ
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/v1CreateRFQRequest'
        required: true
      responses:
        '200':
          description: A successful response.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/v1CreateRFQResponse'
components:
  schemas:
    v1CreateRFQRequest:
      type: object
      properties:
        qtyDecimal:
          type: string
        cashOrderQty:
          type: string
        symbol:
          type: string
        restRemainder:
          type: boolean
        account:
          type: string
      required:
        - symbol
        - restRemainder
        - account
      oneOf:
        - required:
            - qtyDecimal
        - required:
            - cashOrderQty
    v1CreateRFQResponse:
      type: object
      properties:
        rfqId:
          type: string
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

````