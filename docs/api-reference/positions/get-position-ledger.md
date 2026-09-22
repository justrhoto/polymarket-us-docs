> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Get position ledger

> Returns historical position changes for an account.



## OpenAPI

````yaml /institutional/oapi-schemas/positions-schema.json get /v1/positions/ledger
openapi: 3.0.1
info:
  title: Positions API
  version: v1.0.0
servers:
  - url: https://api.prod.polymarketexchange.com
security: []
tags:
  - name: PositionAPI
paths:
  /v1/positions/ledger:
    get:
      tags:
        - Positions
      summary: Get position ledger
      description: Returns historical position changes for an account.
      operationId: PositionAPI_GetPositionLedger
      parameters:
        - name: account
          in: query
          required: true
          schema:
            type: string
          description: >-
            Required. Fully qualified resource name of the account. Example:
            `firms/ISV-Alice/accounts/alice-trading`.
        - name: symbol
          in: query
          required: false
          schema:
            type: string
          description: Optional. Filter by instrument symbol.
        - name: start_time
          in: query
          required: false
          schema:
            type: string
            format: date-time
          description: >-
            Optional. Inclusive lower bound on `update_time` (RFC3339). Clamped
            upstream to `2026-05-01T00:00:00Z`.
        - name: end_time
          in: query
          required: false
          schema:
            type: string
            format: date-time
          description: Optional. Inclusive upper bound on `update_time` (RFC3339).
        - name: page_size
          in: query
          required: false
          schema:
            type: integer
            format: int32
            maximum: 1000
          description: >-
            Optional. Maximum entries to return per page (max 1000). Values
            above 1000 return `InvalidArgument`.
        - name: page_token
          in: query
          required: false
          schema:
            type: string
          description: >-
            Optional. Pagination token from a previous response's
            `nextPageToken` field. Omit for the first request.
        - name: newest_first
          in: query
          required: false
          schema:
            type: boolean
          description: >-
            Optional. If `true`, return entries in descending `update_time`
            order. Default is `false` (oldest first).
      responses:
        '200':
          description: A successful response.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/GetPositionLedgerResponse'
components:
  schemas:
    GetPositionLedgerResponse:
      type: object
      properties:
        entries:
          type: array
          items:
            $ref: '#/components/schemas/PositionLedgerEntry'
          description: Position ledger entries for the requested account / time window.
        nextPageToken:
          type: string
          description: >-
            Pagination token to fetch the next page. Empty when there are no
            more results.
        eof:
          type: boolean
          description: '`true` when this response contains the final page of results.'
    PositionLedgerEntry:
      type: object
      description: >-
        A single position ledger entry. Each entry represents a transition
        between two position snapshots, with the change fields derived from the
        exchange's before/after snapshots: `quantityChange = after.netPosition -
        before.netPosition`, `costChange = after.cost - before.cost`,
        `realizedChange = after.realized - before.realized`. The cumulative
        fields (`netPosition`, `cost`, `realized`) reflect the state immediately
        after this change.
      properties:
        id:
          type: string
          description: Unique entry identifier.
        account:
          type: string
          description: Account this entry belongs to.
        symbol:
          type: string
          description: Instrument symbol.
        quantityChange:
          type: string
          format: int64
          description: Change in net position quantity (after - before).
        costChange:
          type: string
          format: int64
          description: Change in cost basis (after - before).
        realizedChange:
          type: string
          format: int64
          description: Change in realized P&L (after - before).
        netPosition:
          type: string
          format: int64
          description: Net position quantity after this change.
        cost:
          type: string
          format: int64
          description: Cost basis after this change.
        realized:
          type: string
          format: int64
          description: Cumulative realized P&L after this change.
        updateTime:
          type: string
          format: date-time
          description: Timestamp of the position change.
        updateBusinessDate:
          type: string
          description: Business date for this change in `YYYY-MM-DD` format.
        description:
          type: string
          description: >-
            Human-readable reason for the change (e.g., trade fill, expiry,
            correction).

````