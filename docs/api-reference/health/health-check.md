> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Health check

> Check service health status. Returns 200 OK when the service is healthy.



## OpenAPI

````yaml /institutional/oapi-schemas/health-schema.json get /v1/health
openapi: 3.0.1
info:
  title: Health API
  version: v1.0.0
servers:
  - url: https://api.prod.polymarketexchange.com
security: []
tags:
  - name: HealthAPI
paths:
  /v1/health:
    get:
      tags:
        - Health
      summary: Health check
      description: Check service health status. Returns 200 OK when the service is healthy.
      operationId: HealthAPI_HealthCheck
      responses:
        '200':
          description: Service is healthy
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/HealthCheckResponse'
components:
  schemas:
    HealthCheckResponse:
      type: object
      properties:
        status:
          type: string
          description: Health status (e.g., 'ok')

````