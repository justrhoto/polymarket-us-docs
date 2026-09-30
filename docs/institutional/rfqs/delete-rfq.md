> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Delete RFQ

> Closes an open RFQ.



## OpenAPI

````yaml /institutional/oapi-schemas/rfqs-schema.json delete /v1/rfqs/{rfqId}
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
  /v1/rfqs/{rfqId}:
    delete:
      tags:
        - RFQs
      summary: Delete RFQ
      description: Closes an open RFQ.
      operationId: RFQAPI_DeleteRFQ
      parameters:
        - name: rfqId
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
                $ref: '#/components/schemas/v1DeleteRFQResponse'
components:
  schemas:
    v1DeleteRFQResponse:
      type: object
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

````