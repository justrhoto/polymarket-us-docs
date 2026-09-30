> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Accept quote

> Accepts one side of a quote.



## OpenAPI

````yaml /institutional/oapi-schemas/rfqs-schema.json put /v1/rfqs/{rfqId}/quotes/{quoteId}/accept
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
  /v1/rfqs/{rfqId}/quotes/{quoteId}/accept:
    put:
      tags:
        - RFQs
      summary: Accept quote
      description: Accepts one side of a quote.
      operationId: RFQAPI_AcceptQuote
      parameters:
        - name: rfqId
          in: path
          required: true
          schema:
            type: string
        - name: quoteId
          in: path
          required: true
          schema:
            type: string
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/RFQAPIAcceptQuoteBody'
        required: true
      responses:
        '200':
          description: A successful response.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/v1AcceptQuoteResponse'
components:
  schemas:
    RFQAPIAcceptQuoteBody:
      type: object
      properties:
        acceptedSide:
          $ref: '#/components/schemas/v1Side'
      required:
        - acceptedSide
    v1AcceptQuoteResponse:
      type: object
    v1Side:
      type: string
      enum:
        - SIDE_BUY
        - SIDE_SELL
      description: Side indicates the side of an Order.
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

````