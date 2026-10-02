> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Create quote

> Creates a quote for an RFQ. Every successful call returns a new quoteId, including replacements. See [quote replacement](/institutional/rfqs/overview#create-or-replace-a-quote).



## OpenAPI

````yaml /institutional/oapi-schemas/rfqs-schema.json post /v1/rfqs/quotes
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
  /v1/rfqs/quotes:
    post:
      tags:
        - RFQs
      summary: Create quote
      description: >-
        Creates a quote for an RFQ. Every successful call returns a new quoteId,
        including replacements. See [quote
        replacement](/institutional/rfqs/overview#create-or-replace-a-quote).
      operationId: RFQAPI_CreateQuote
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/v1CreateQuoteRequest'
        required: true
      responses:
        '200':
          description: A successful response.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/v1CreateQuoteResponse'
components:
  schemas:
    v1CreateQuoteRequest:
      type: object
      properties:
        rfqId:
          type: string
        buyPrice:
          type: string
          description: >-
            Price offered for a requester BUY order; the quote creator takes
            SELL.
        sellPrice:
          type: string
          description: >-
            Price offered for a requester SELL order; the quote creator takes
            BUY.
        restRemainder:
          type: boolean
        postOnly:
          type: boolean
        account:
          type: string
      required:
        - rfqId
        - buyPrice
        - sellPrice
        - restRemainder
        - account
    v1CreateQuoteResponse:
      type: object
      properties:
        quoteId:
          type: string
          description: >-
            New quote ID. Changes on every successful CreateQuote, including
            replacements.
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

````

This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.