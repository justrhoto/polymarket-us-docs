> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Confirm quote

> Confirms an accepted quote during last look.



## OpenAPI

````yaml /institutional/oapi-schemas/rfqs-schema.json put /v1/rfqs/{rfqId}/quotes/{quoteId}/confirm
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
  /v1/rfqs/{rfqId}/quotes/{quoteId}/confirm:
    put:
      tags:
        - RFQs
      summary: Confirm quote
      description: Confirms an accepted quote during last look.
      operationId: RFQAPI_ConfirmQuote
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
              $ref: '#/components/schemas/RFQAPIConfirmQuoteBody'
        required: true
      responses:
        '200':
          description: A successful response.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/v1ConfirmQuoteResponse'
components:
  schemas:
    RFQAPIConfirmQuoteBody:
      type: object
    v1ConfirmQuoteResponse:
      type: object
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

````