> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Funding Management

> Manage funding sources, accounts, and transactions

<Warning>
  **BETA - SUBJECT TO CHANGE** - This API is in beta and may change without notice.
</Warning>

# Funding Management

The Funding API provides read access to funding sources, accounts, and transaction history.

## Authentication

<Warning>
  **Authentication Required** - All Funding endpoints require authentication. Include your access token in the `Authorization` header.
</Warning>

```bash theme={null}
Authorization: Bearer YOUR_ACCESS_TOKEN
```

See [Authentication Setup](/trader-guide/authentication) for instructions on obtaining tokens.

## Endpoints

| Method  | Endpoint                               | Description                  |
| ------- | -------------------------------------- | ---------------------------- |
| `GET`   | `/v1/funding/sources`                  | List funding sources         |
| `GET`   | `/v1/funding/accounts`                 | List funding accounts        |
| `PATCH` | `/v1/funding/accounts/{id}`            | Update funding account       |
| `GET`   | `/v1/funding/transactions`             | List transactions            |
| `GET`   | `/v1/funding/transaction-requirements` | Get transaction requirements |

## List Funding Sources

Retrieve all funding sources (payment methods) available to the user.

### Request

```bash theme={null}
GET /v1/funding/sources?fundingSourceType=FUNDING_SOURCE_TYPE_AEROPAY_BANK_ACCOUNT
```

### Query Parameters

| Parameter           | Type    | Description          |
| ------------------- | ------- | -------------------- |
| `pageSize`          | integer | Results per page     |
| `pageToken`         | string  | Pagination token     |
| `fundingSourceIds`  | array   | Filter by source IDs |
| `fundingSourceType` | enum    | Filter by type       |

### Funding Source Types

| Type                                       | Description              |
| ------------------------------------------ | ------------------------ |
| `FUNDING_SOURCE_TYPE_BANK_ACCOUNT`         | Traditional bank account |
| `FUNDING_SOURCE_TYPE_AEROPAY_BANK_ACCOUNT` | Aeropay-linked bank      |
| `FUNDING_SOURCE_TYPE_CHECKOUT_CARD`        | Payment card             |
| `FUNDING_SOURCE_TYPE_APPLE_PAY`            | Apple Pay                |

### Response

```json theme={null}
{
  "fundingSources": [
    {
      "id": "fs_abc123",
      "type": "FUNDING_SOURCE_TYPE_AEROPAY_BANK_ACCOUNT",
      "aeropayBankAccountDetails": {
        "userId": "aero_user_123",
        "bankAccountId": "ba_123",
        "name": "John's Checking",
        "bankName": "Chase Bank",
        "accountLast4": "4567",
        "accountType": "checking"
      },
      "transactionLimits": {
        "currencyLimits": [
          {
            "currency": "USD",
            "maxDepositRequestAmount": {"value": "10000.00"},
            "maxDepositDailyAmount": {"value": "25000.00"},
            "maxDeposit60dayAmount": {"value": "100000.00"}
          }
        ]
      },
      "disabled": false
    }
  ],
  "nextPageToken": "",
  "eof": true
}
```

## List Funding Accounts

Retrieve funding accounts associated with the user.

### Request

```bash theme={null}
GET /v1/funding/accounts?accountType=ACCOUNT_TYPE_CLEARING
```

### Query Parameters

| Parameter          | Type    | Description                  |
| ------------------ | ------- | ---------------------------- |
| `pageSize`         | integer | Results per page             |
| `pageToken`        | string  | Pagination token             |
| `accountIds`       | array   | Filter by account IDs        |
| `fundingSourceIds` | array   | Filter by funding source IDs |
| `accountType`      | enum    | Filter by account type       |

### Account Types

| Type                    | Description          |
| ----------------------- | -------------------- |
| `ACCOUNT_TYPE_CLEARING` | Main trading account |
| `ACCOUNT_TYPE_REVENUE`  | Revenue account      |
| `ACCOUNT_TYPE_HOLDING`  | Holding account      |
| `ACCOUNT_TYPE_ADVANCE`  | Advance account      |

### Response

```json theme={null}
{
  "accounts": [
    {
      "id": "fa_123",
      "name": "Main Trading Account",
      "accountType": "ACCOUNT_TYPE_CLEARING",
      "associatedFundingSources": ["fs_abc123", "fs_def456"],
      "riskAccountId": "risk_123",
      "creationTime": "2024-01-15T10:00:00Z"
    }
  ],
  "nextPageToken": "",
  "eof": true
}
```

## List Transactions

Retrieve transaction history with filtering options.

### Request

```bash theme={null}
GET /v1/funding/transactions?accountId=fa_123&transactionTypes=TRANSACTION_TYPE_DEPOSIT&newestFirst=true
```

### Query Parameters

| Parameter           | Type     | Description                |
| ------------------- | -------- | -------------------------- |
| `pageSize`          | integer  | Results per page           |
| `pageToken`         | string   | Pagination token           |
| `accountId`         | string   | Filter by account          |
| `currency`          | string   | Filter by currency         |
| `transactionTypes`  | array    | Filter by transaction type |
| `transactionStates` | array    | Filter by state            |
| `startTime`         | datetime | Start of date range        |
| `endTime`           | datetime | End of date range          |
| `newestFirst`       | boolean  | Sort order                 |

### Transaction Types

| Type                                 | Description            |
| ------------------------------------ | ---------------------- |
| `TRANSACTION_TYPE_DEPOSIT`           | Deposit transaction    |
| `TRANSACTION_TYPE_WITHDRAWAL`        | Withdrawal transaction |
| `TRANSACTION_TYPE_TRANSFER`          | Internal transfer      |
| `TRANSACTION_TYPE_EXECUTION_FEE`     | Trading fee            |
| `TRANSACTION_TYPE_SETTLEMENT_FEE`    | Settlement fee         |
| `TRANSACTION_TYPE_MANUAL_ADJUSTMENT` | Manual adjustment      |

### Transaction States

| State                            | Description |
| -------------------------------- | ----------- |
| `TRANSACTION_STATE_ACKNOWLEDGED` | Received    |
| `TRANSACTION_STATE_PROCESSING`   | In progress |
| `TRANSACTION_STATE_COMPLETED`    | Completed   |
| `TRANSACTION_STATE_CANCELLED`    | Cancelled   |
| `TRANSACTION_STATE_REFUNDED`     | Refunded    |

### Response

```json theme={null}
{
  "transactions": [
    {
      "transactionId": "txn_123",
      "fundingTransactionId": "ft_deposit_789",
      "amount": "100.00",
      "currency": "USD",
      "description": "Account funding",
      "ledgerEntryType": "LEDGER_ENTRY_TYPE_CREDIT",
      "transactionType": "TRANSACTION_TYPE_DEPOSIT",
      "transactionState": "TRANSACTION_STATE_COMPLETED",
      "transactTime": "2024-01-15T10:30:00Z",
      "accountId": "fa_123",
      "fundingSourceId": "fs_abc123",
      "fundingSourceType": "FUNDING_SOURCE_TYPE_AEROPAY_BANK_ACCOUNT",
      "beforeBalance": "0.00",
      "afterBalance": "100.00"
    }
  ],
  "nextPageToken": "",
  "eof": true
}
```

## Get Transaction Requirements

Check requirements and limits before initiating transactions. This is especially important for **withdrawal requirements**.

### Request

```bash theme={null}
GET /v1/funding/transaction-requirements?accountIds=fa_123
```

### Query Parameters

| Parameter    | Type    | Description           |
| ------------ | ------- | --------------------- |
| `pageSize`   | integer | Results per page      |
| `pageToken`  | string  | Pagination token      |
| `accountIds` | array   | Filter by account IDs |

### Response

```json theme={null}
{
  "transactionRequirements": [
    {
      "id": "req_123",
      "accountId": "fa_123",
      "transactionType": "TRANSACTION_TYPE_WITHDRAWAL",
      "fundingSourceId": "fs_bank_b",
      "amount": "500.00",
      "currency": "USD",
      "description": "Must withdraw to original deposit source",
      "triggers": ["withdrawal_requirement"]
    },
    {
      "id": "req_124",
      "accountId": "fa_123",
      "transactionType": "TRANSACTION_TYPE_WITHDRAWAL",
      "fundingSourceId": "fs_bank_a",
      "amount": "1000.00",
      "currency": "USD",
      "description": "Must withdraw to original deposit source",
      "triggers": ["withdrawal_requirement"]
    }
  ],
  "nextPageToken": "",
  "eof": true
}
```

***

## Update Funding Account

Update account settings (limited fields).

### Request

```bash theme={null}
PATCH /v1/funding/accounts/fa_123
```

```json theme={null}
{
  "account": {
    "name": "Updated Account Name",
    "aliases": {
      "display_name": "Trading Account"
    }
  }
}
```

### Response

```json theme={null}
{
  "account": {
    "id": "fa_123",
    "name": "Updated Account Name",
    ...
  }
}
```

## Pagination

All list endpoints support cursor-based pagination:

1. Make initial request without `pageToken`
2. Check `eof` field - if `false`, more results exist
3. Use `nextPageToken` for subsequent requests
4. Continue until `eof` is `true`

```python theme={null}
page_token = None
while True:
    params = {"pageSize": 100}
    if page_token:
        params["pageToken"] = page_token

    response = get_transactions(params)
    process(response["transactions"])

    if response["eof"]:
        break
    page_token = response["nextPageToken"]
```
