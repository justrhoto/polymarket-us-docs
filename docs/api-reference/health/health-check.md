> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Health check

> Check service health status



## OpenAPI

````yaml /institutional/oapi-schemas/health-schema.json get /v1/health
openapi: 3.0.3
info:
  title: Health API
  version: v1.0.0
servers:
  - url: https://api.prod.polymarketexchange.com
    description: Production server
security:
  - bearerAuth: []
tags:
  - name: HealthAPI
paths:
  /v1/health:
    get:
      tags:
        - Health
      summary: Health check
      description: Check service health status
      operationId: HealthAPI_HealthCheck
      responses:
        '200':
          description: A successful response.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/v1HealthCheckResponse'
components:
  schemas:
    v1HealthCheckResponse:
      type: object
      properties:
        status:
          type: string
          description: Health status (e.g., 'ok')
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

````