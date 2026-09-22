> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Digital Intelligence

> Capture the Socure Digital Intelligence session_token to keep your instant-approval rate high and your REVIEW rate low.

<Warning>
  **BETA — SUBJECT TO CHANGE.** This API is in beta and may change without notice.
</Warning>

Socure **Digital Intelligence (DI)** is a device and behavioural risk-assessment script that runs in the participant's browser or app during your KYC form. It produces a short-lived **`session_token`** that you include in `POST /v1/kyc/start`.

<Info>
  **Audience: developers (with a product-team section below).** The `session_token` is **optional but strongly recommended** — it is the single most effective lever for keeping your REVIEW rate low and your instant-approval rate high.
</Info>

## Why it matters

Socure's evaluation combines the identity data you submit (PII) with device and behavioural context. The DI signals are what tip borderline cases into a clear **ACCEPT**:

* **More participants approved instantly.** Without DI signals, Socure has less confidence in legitimate participants, and more of them land in **REVIEW**.
* **Lower REVIEW rate.** A REVIEW means onboarding isn't finished — the participant must either upload a photo ID ([DocV](/partners/onboarding/kyc/verification-flow#document-verification-docv) — adds friction and drop-off) or wait for a [manual review](/partners/onboarding/kyc/verification-flow#manual-compliance-review) (hours to days). Every reduction in REVIEW is a direct conversion win.
* **Device-level fraud detection.** DI also flags velocity abuse, bot patterns, and fraud rings, improving the quality of your participant population.

Omitting the `session_token` will **not** cause an evaluation to fail — but expect a higher false-REVIEW rate.

## What data DI collects

DI collects **non-PII** device and session signals only. PII (name, SSN, address) is transmitted solely when you call `POST /v1/kyc/start`.

| Signal type         | Examples                                                  |
| ------------------- | --------------------------------------------------------- |
| Device fingerprint  | Browser type/version, OS, screen resolution, fonts        |
| Network signals     | IP address, ASN, proxy/VPN detection                      |
| Behavioural signals | Typing cadence, form-interaction timing, pointer patterns |
| Session metadata    | Session duration, page-interaction sequence               |

## Implementation

The Socure `sdk_key` is provided by the Polymarket US onboarding team. A **single** SDK key initialises both Digital Intelligence and [DocV](/partners/onboarding/kyc/verification-flow#document-verification-docv). It is a **public** key and safe to include in client-side code. Initialise DI when the KYC form page loads, then call `getSessionToken()` immediately before submitting the form.

<CodeGroup>
  ```javascript Web theme={null}
  // 1. On KYC form page load — initialise early
  import { Socure } from '@socure-inc/socure-sdk';
  Socure.init(sdkKey);

  // 2. Just before form submission — get the token
  const sessionToken = await Socure.getSessionToken();

  // 3. Include it in your KYC request
  await fetch('https://api.preprod.polymarketexchange.com/v1/kyc/start', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      external_id: 'your-internal-user-id-123',
      // ...other fields...
      session_token: sessionToken,
      ip_address: userIpAddress,
    }),
  });
  ```

  ```swift iOS theme={null}
  import SocureSDK

  // On KYC view load
  SocureSDK.shared.initialize(publicKey: sdkKey)

  // Before submission
  SocureSDK.shared.getSessionToken { sessionToken, error in
      guard let token = sessionToken else { return }
      // submit KYC with session_token = token
  }
  ```

  ```kotlin Android theme={null}
  import com.socure.android.sdk.SocureSDK

  // On KYC screen creation
  SocureSDK.init(context, sdkKey)

  // Before submission
  SocureSDK.getSessionToken { sessionToken ->
      // submit KYC with session_token = sessionToken
  }
  ```
</CodeGroup>

<Tip>
  Call `init()` when the form page loads so the signal collection is spread across the participant's time on the page. `getSessionToken()` typically completes in under 100ms.
</Tip>

## Addressing product-team concerns

<AccordionGroup>
  <Accordion title="We don't want a third-party script on our site">
    The DI script is hosted by Socure and loaded from `sdk.socure.com`. Load it **only** on your KYC form page(s) — not site-wide. It runs during the KYC flow and collects non-PII signals.
  </Accordion>

  <Accordion title="We already collect device/IP data — can't we pass it directly?">
    No. The DI session token is cryptographically tied to Socure's own collection event; it cannot be replicated by forwarding equivalent data through another channel.
  </Accordion>

  <Accordion title="Will this slow down our form?">
    No. The script loads asynchronously and `getSessionToken()` typically returns in under 100ms. Initialising on page load spreads the work across the participant's time on the page.
  </Accordion>
</AccordionGroup>

## Next steps

<CardGroup cols={2}>
  <Card title="Verification Flow" icon="id-card" href="/partners/onboarding/kyc/verification-flow">
    Submit the participant with the `session_token` and handle each outcome.
  </Card>

  <Card title="Overview" icon="circle-info" href="/partners/onboarding/kyc/overview">
    How the Socure-backed KYC process fits together.
  </Card>
</CardGroup>
