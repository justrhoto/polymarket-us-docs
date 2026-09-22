> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Webhooks

> Receive terminal KYC outcomes (approved / rejected) via signed webhooks.

<Warning>
  **BETA — SUBJECT TO CHANGE.** This API is in beta and may change without notice.
</Warning>

KYC outcomes that resolve after the initial request — instant approvals (whose account provisioning completes asynchronously), DocV results, and manual-review decisions — are delivered to a **webhook URL you register**. Webhooks are how you learn a participant's final provisioned `provisioned_participant` and any rejection.

<Info>
  **Only terminal outcomes are delivered.** Intermediate states (DocV in progress, manual review) produce **no** webhook — poll [`GET /v1/kyc/status`](/partners/onboarding/kyc/verification-flow#check-status) if you need to track them.
</Info>

## Register your webhook

`POST /v1/kyc/webhook` — requires the `write:kyc` scope. Register **once per firm** (not per participant). Registration runs a test POST to your URL before saving; if the test fails, nothing is saved and you may retry.

<Note>
  Also available over gRPC as `polymarket.us.kyc.v1.KYCAPI/SetWebhookURL` with the same two fields and the same validation behavior — see the [transport mapping](/partners/onboarding/kyc/overview#rest-and-grpc).
</Note>

```bash theme={null}
POST /v1/kyc/webhook
```

```json theme={null}
{
  "webhook_url": "https://your-platform.com/kyc-notifications",
  "signing_secret": "whsec_<base64-encoded-key>"
}
```

### Request fields

| Field            | Type   | Required | Notes                                                                                                                                                                                                                          |
| ---------------- | ------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `webhook_url`    | string | Yes      | HTTPS URL where notifications are delivered                                                                                                                                                                                    |
| `signing_secret` | string | No       | Your Standard Webhooks signing secret in `whsec_<base64-key>` format, where the decoded key is at least 24 bytes (e.g. `whsec_` followed by 32 random bytes in standard padded base64). Omit to receive **unsigned** webhooks. |

<Warning>
  **You bring your own signing secret.** Polymarket US never generates or returns a secret — you supply and keep it. Use the Standard Webhooks `whsec_<base64-key>` format (e.g. `whsec_` followed by the output of `openssl rand -base64 32`). Registration is **last-writer-wins**: re-registering without a `signing_secret` **clears** any previously stored one (switching you to unsigned).
</Warning>

### Response

```json theme={null}
{
  "validated": true,
  "message": "Webhook URL registered and validated successfully"
}
```

| Field       | Type   | Notes                                         |
| ----------- | ------ | --------------------------------------------- |
| `validated` | bool   | `true` if the test POST to your URL succeeded |
| `message`   | string | Status / failure detail                       |

### Test-POST contract

Registration sends a `POST` to your URL with a normal notification envelope whose `event_type` is **`webhook.test`** and whose `data` is a fixed informational message. It is signed (same scheme as real deliveries) when you supplied a `signing_secret`. Your endpoint passes only by returning a **2xx**. Redirects are not followed, and URLs that resolve to private or internal IP ranges are refused.

## Receiving notifications

Polymarket US sends an HTTP `POST` with a JSON body to your registered URL.

### Headers

Signed deliveries follow the [Standard Webhooks](https://www.standardwebhooks.com/) convention. The three signing headers are present **only when a signing secret is configured**.

| Header              | Notes                                                                                             |
| ------------------- | ------------------------------------------------------------------------------------------------- |
| `webhook-id`        | Stable, retry-invariant event ID — use it to deduplicate                                          |
| `webhook-timestamp` | Unix seconds at send time                                                                         |
| `webhook-signature` | Space-delimited list of versioned signatures; currently a single `v1,<base64(HMAC-SHA256)>` entry |
| `Content-Type`      | `application/json`                                                                                |

### Body

<Note>
  Webhook `data` fields are `snake_case` (e.g. `external_id`, `provisioned_participant`), unlike the `camelCase` REST responses. See [Field naming](/partners/onboarding/kyc/overview#field-naming).
</Note>

```json theme={null}
{
  "event_type": "kyc.approved",
  "event_id": "01J0...",
  "event_time": "2026-04-24T15:32:00Z",
  "data": {
    "external_id": "your-internal-user-id-123",
    "user_id": "your-internal-user-id-123",
    "kyc_eval_id": "<verification provider evaluation id>",
    "firm_id": "your-firm-id",
    "status": "KYC_STATUS_APPROVED",
    "provisioned_participant": "firms/ISV-Participant-YourFirmID/users/...",
    "provisioned_account": "firms/ISV-YourFirmID/accounts/8f3a2c...e1",
    "status_set_at": "2026-04-24T15:32:00.123456789Z"
  }
}
```

### Event types

| `event_type`   | Meaning                                                                  |
| -------------- | ------------------------------------------------------------------------ |
| `kyc.approved` | Participant approved and backend entities provisioned                    |
| `kyc.rejected` | Participant rejected                                                     |
| `webhook.test` | Registration-time test event only (see above); never delivered afterward |

### `data` fields

Empty fields are omitted from the JSON.

| Field                     | Present on     | Notes                                                                                                                                                                                                                              |
| ------------------------- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `external_id`             | both           | The identifier you supplied at start. Your correlation key; matches `status.externalId` and the `GET /v1/kyc/status` lookup                                                                                                        |
| `user_id`                 | both           | Same value as `external_id` (legacy field name)                                                                                                                                                                                    |
| `kyc_eval_id`             | both           | Verification-provider evaluation id, carried under its own field. Optional — present only when the provider id is exposed. Never use it as your correlation key                                                                    |
| `firm_id`                 | both           | Your firm ID                                                                                                                                                                                                                       |
| `status`                  | both           | `KYC_STATUS_APPROVED` or `KYC_STATUS_REJECTED`                                                                                                                                                                                     |
| `status_set_at`           | both           | RFC 3339 timestamp of the decision                                                                                                                                                                                                 |
| `provisioned_participant` | `kyc.approved` | Engine-neutral participant identifier — opaque string. Use it to act on behalf of the participant                                                                                                                                  |
| `provisioned_account`     | `kyc.approved` | Fully qualified DCM account name provisioned on approval. It exactly matches `BalanceLedgerEntry.account` on the [balance ledger stream](/streaming-endpoints/balance-ledger-stream); store it to route ledger entries to the user |
| `date_of_birth`           | `kyc.approved` | The participant's date of birth may be included. Treat as sensitive PII                                                                                                                                                            |
| `referral_code_owned`     | `kyc.approved` | Present when an owned referral code is assigned                                                                                                                                                                                    |
| `rejection_reason`        | `kyc.rejected` | Finer-grained rejection detail (provider sub-status)                                                                                                                                                                               |

## Using these identifiers to trade

When you place an order on behalf of a participant, **`provisioned_participant` is the "who"** — pass it as the [`x-participant-id`](/partners/get-connected/authentication#acting-on-behalf-of-a-participant) header on participant-scoped requests (trading, positions, reports). It is the only provisioning identifier you need.

| KYC field (webhook)       | Same value in [`GET /v1/kyc/status`](/partners/onboarding/kyc/verification-flow#approval) | Format                                       | What to do with it                                                                                                                               |
| ------------------------- | ----------------------------------------------------------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `provisioned_participant` | `participantId`                                                                           | `firms/ISV-Participant-YourFirmID/users/...` | Send as the **`x-participant-id` header** — this is *who* the order is for                                                                       |
| `external_id` / `user_id` | `status.externalId`                                                                       | your own string                              | **Your** correlation key only — store it to map back to your user. **Never** sent to Polymarket US to identify the participant on a trading call |

<Warning>
  **Use `provisioned_participant`, not `external_id` / `user_id`, to identify the participant on a trading call.** The `external_id` (and its legacy duplicate `user_id`) is the identifier *you* supplied — it is meaningful only inside your own systems. The exchange identifies the participant by the `provisioned_participant` value carried in the `x-participant-id` header.
</Warning>

The webhook and `GET /v1/kyc/status` carry the **same value** under different field names — the webhook calls it `provisioned_participant`, while the status read calls it `participantId`.

```bash theme={null}
# Placing an order for the participant from a kyc.approved webhook
curl -X POST https://api.polymarket.us/v1/orders \
  -H "Authorization: Bearer {access_token}" \
  -H "Content-Type: application/json" \
  -H "x-participant-id: firms/ISV-Participant-YourFirmID/users/your-internal-user-id-123" \
  -d '{
    "symbol": "tec-nfl-sbw-2026-02-08-kc",
    "side": "SIDE_BUY",
    "order_qty": 100,
    "price": 550,
    "type": "ORDER_TYPE_LIMIT",
    "time_in_force": "TIME_IN_FORCE_GOOD_TILL_CANCEL"
  }'
```

## Delivery semantics

* **At-least-once.** Deduplicate on `event_id` (the `webhook-id` header) — you may receive the same event more than once.
* **Retries.** Only a `2xx` counts as delivered. Redirects are not followed (a `3xx` is a failed delivery); every non-2xx or transport error is retried with jittered exponential backoff up to a maximum attempt count. `Retry-After` is honored on `408` / `429`. A repeatedly-failing endpoint is **circuit-broken**: deliveries pause for a cooldown that grows with each consecutive re-open, then resume.
* **Respond fast.** Return `2xx` promptly once you've durably accepted the event; do heavy processing asynchronously.

## Verifying the signature

Because the secret is in the standard `whsec_`/base64 format, a [Standard Webhooks SDK](https://github.com/standard-webhooks/standard-webhooks/tree/main/libraries) verifies deliveries out of the box — initialise it with the **default** constructor (e.g. `NewWebhook` in Go), passing the secret exactly as you registered it. No raw-key escape hatch (`NewWebhookRaw`) is needed.

If you verify inline instead, the signed content is `<webhook-id>.<webhook-timestamp>.<raw body>` — the **raw request bytes**, before any JSON re-serialization. The HMAC key is the **decoded** Standard Webhooks key: strip the optional `whsec_` prefix from your `signing_secret` and base64-decode the remainder using standard padded base64. Compute the expected signature, then **constant-time compare** it against each space-delimited candidate in `webhook-signature`; accept if any matches.

```go theme={null}
// Derive the key: drop the optional "whsec_" prefix, then base64-decode.
key, err := base64.StdEncoding.DecodeString(strings.TrimPrefix(secret, "whsec_"))
if err != nil { /* reject: malformed secret */ }

// signed content: "<webhook-id>.<webhook-timestamp>." + raw body
mac := hmac.New(sha256.New, key)
mac.Write([]byte(id + "." + timestamp + "."))
mac.Write(body)
expected := "v1," + base64.StdEncoding.EncodeToString(mac.Sum(nil))

for _, candidate := range strings.Fields(signatureHeader) {
    if hmac.Equal([]byte(candidate), []byte(expected)) {
        return true // valid
    }
}
return false // reject
```

<Tip>
  Reject deliveries whose `webhook-timestamp` is too old to limit replay exposure, and always verify against the **raw** body you received rather than a re-encoded copy.
</Tip>

## Next steps

<CardGroup cols={2}>
  <Card title="Verification Flow" icon="id-card" href="/partners/onboarding/kyc/verification-flow">
    The synchronous outcomes that precede these webhooks.
  </Card>

  <Card title="Overview" icon="circle-info" href="/partners/onboarding/kyc/overview">
    How the KYC process fits together.
  </Card>
</CardGroup>
