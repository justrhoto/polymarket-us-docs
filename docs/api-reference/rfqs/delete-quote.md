> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Delete quote

> Deletes a quote so it can no longer be accepted.



## OpenAPI

````yaml /institutional/oapi-schemas/rfqs-schema.json delete /v1/rfqs/{rfqId}/quotes/{quoteId}
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
  /v1/rfqs/{rfqId}/quotes/{quoteId}:
    delete:
      tags:
        - RFQs
      summary: Delete quote
      description: Deletes a quote so it can no longer be accepted.
      operationId: RFQAPI_DeleteQuote
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
      responses:
        '200':
          description: A successful response.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/v1DeleteQuoteResponse'
components:
  schemas:
    v1DeleteQuoteResponse:
      type: object
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

````