> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Get instrument metadata

> Returns miscellaneous instrument metadata



## OpenAPI

````yaml /institutional/oapi-schemas/refdata-schema.json post /v1/refdata/metadata
openapi: 3.0.3
info:
  title: Refdata API
  version: v1.0.0
servers:
  - url: https://api.prod.polymarketexchange.com
    description: Production server
security:
  - bearerAuth: []
tags:
  - name: RefDataAPI
paths:
  /v1/refdata/metadata:
    post:
      tags:
        - ReferenceData
      summary: Get instrument metadata
      description: Returns miscellaneous instrument metadata
      operationId: RefDataAPI_GetInstrumentMetadata
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/v1GetInstrumentMetadataRequest'
        description: Request for getting instrument metadata.
        required: true
      responses:
        '200':
          description: A successful response.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/v1GetInstrumentMetadataResponse'
components:
  schemas:
    v1GetInstrumentMetadataRequest:
      type: object
      description: Request for getting instrument metadata.
    v1GetInstrumentMetadataResponse:
      type: object
      properties:
        metadata:
          type: object
          additionalProperties:
            type: string
      description: Response with instrument metadata.
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

````