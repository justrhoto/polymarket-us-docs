> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# End-User Legal Agreements

> The four documents every end user accepts during onboarding, the exact acceptance language and flow, and how agreement versioning works.

Every end user accepts the Polymarket US legal document set during onboarding, inside your app. This page covers the required documents, the acceptance language and flow, and how agreement versioning works. You can build against this now — the structure will not change.

Identity verification (KYC), funding, and account provisioning are covered in the [Integration Journey](/partners/integration-journey) and the [KYC](/partners/onboarding/kyc/overview) documentation.

<Info>
  **Regulatory context.** Polymarket US is a CFTC-regulated marketplace for event contracts. Two distinct regulated entities are party to the customer relationship: **QCX LLC** d/b/a Polymarket US, the Designated Contract Market (DCM), and **QC Clearing LLC** d/b/a Polymarket Clearing, the Derivatives Clearing Organization (DCO).
</Info>

## Required documents

Four documents make up the **complete** legal set. No additional terms and conditions apply beyond these four.

| Document                      | Issuing entity                                  | Location                                                                                                                                           |
| ----------------------------- | ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Participant Agreement**     | QCX LLC and QC Clearing LLC (jointly, "PMUS")   | [polymarketexchange.com/files/legal/latest/participant-agreement](https://polymarketexchange.com/files/legal/latest/participant-agreement)         |
| **Exchange Rulebook**         | QCX LLC d/b/a Polymarket US (DCM)               | [polymarketexchange.com/regulatory.html](https://polymarketexchange.com/regulatory.html)                                                           |
| **Clearinghouse Rulebook**    | QC Clearing LLC d/b/a Polymarket Clearing (DCO) | [polymarketexchange.com/clearing/](https://polymarketexchange.com/clearing/)                                                                       |
| **Risk Disclosure Statement** | PMUS                                            | [polymarketexchange.com/files/legal/latest/risk-disclosure-statement](https://polymarketexchange.com/files/legal/latest/risk-disclosure-statement) |

The Participant Agreement is a **click-through agreement**: its first-page language makes clicking "I Accept" the legal equivalent of a manual signature. Customers accept the unmodified document through an affirmative in-app action; it is not filled out or signed by hand.

## Acceptance flow

Display the following language, exactly as written, immediately above the acceptance button. The four document names must render as live hyperlinks to the documents in [Required documents](#required-documents):

> "By clicking below, I hereby (i) acknowledge that I have read and understood, and consent to the terms of the [Participant Agreement](https://polymarketexchange.com/files/legal/latest/participant-agreement) and the Rulebooks ([Polymarket Clearing Rulebook](https://polymarketexchange.com/clearing/), [Polymarket US Rulebook](https://polymarketexchange.com/regulatory.html)) and (ii) certify that I will abide by the Rules stated therein, as may be amended from time to time, and any applicable laws or regulations affecting PMUS, my use of PMUS and the transactions executed and/or cleared through PMUS. I also hereby acknowledge that I have read and understood the [Risk Disclosure](https://polymarketexchange.com/files/legal/latest/risk-disclosure-statement)."

### Requirements

| #       | Requirement               | What it means                                                                                                                                                                                                                                                  |
| ------- | ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **R-1** | Verbatim text             | Display the acceptance language exactly as written — no paraphrasing, abbreviation, translation, or splitting across multiple checkboxes.                                                                                                                      |
| **R-2** | Single affirmative action | Capture acceptance through one explicit, user-initiated action. Pre-checked boxes, implied consent, or acceptance bundled into an unrelated action do not satisfy this requirement.                                                                            |
| **R-3** | Live document links       | All four hyperlinks must resolve to the documents in [Required documents](#required-documents) and be accessible at the moment of acceptance. Do not host modified, excerpted, or re-rendered copies.                                                          |
| **R-4** | Unmodified documents      | The Participant Agreement is accepted as-is. There is no per-user fill-in, countersignature, or partner-specific rider.                                                                                                                                        |
| **R-5** | Timing                    | Acceptance is captured at time of application — before onboarding completes and before the customer's first trade. A customer who has not completed the acceptance action must not be provisioned for trading.                                                 |
| **R-6** | Record of acceptance      | Retain a record of each acceptance event: the customer identifier, timestamp, and the document set accepted. The accepted agreement version is also transmitted to Polymarket US on the KYC start request (see [Agreement versioning](#agreement-versioning)). |

## Agreement versioning

The [KYC start request](/partners/onboarding/kyc/verification-flow) (`POST /v1/kyc/start`) carries an `agreement.version` field identifying the version of the Participant Agreement the customer accepted.

**Version value.** The version is the **effective date** of the current Participant Agreement, formatted `MM.DD.YYYY`. The current value is `08.06.2026`.

```json theme={null}
{
  "agreement": {
    "version": "08.06.2026",
    "signed_at": "2026-04-24T14:30:00Z"
  }
}
```

How updates work:

* Notice of agreement updates is posted on the Polymarket US website.
* When the agreement is updated, the new effective date becomes the value to send in `agreement.version`.
* The updated Participant Agreement publishes automatically to its location in [Required documents](#required-documents), so the document link in your acceptance flow always resolves to the current version.

<Warning>
  **Do not hard-code the version.** Treat the version value as configuration your system can rotate without a code change.
</Warning>

## Next steps

<CardGroup cols={2}>
  <Card title="Start KYC" icon="id-card" href="/partners/onboarding/kyc/verification-flow">
    Submit the accepted `agreement.version` on `POST /v1/kyc/start`.
  </Card>

  <Card title="Onboard Participants" icon="user-plus" href="/partners/onboarding/onboard-participants">
    How acceptance fits into the wider participant onboarding flow.
  </Card>
</CardGroup>
