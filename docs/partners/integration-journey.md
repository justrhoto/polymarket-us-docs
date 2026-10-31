> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Integration Journey

> The end-to-end path from partner onboarding to live trading — and the recommended order to build it.

This page is your map. It lays out the partner integration end to end so you can see how the pieces fit before you start building, then points you to the right guide for each step.

## The journey at a glance

```mermaid theme={null}
graph TD
    A["1 · Understand platform & your role"] --> C["2 · Get connected — onboarding + auth"]
    C --> D["3 · Onboard participants — KYC"]
    D --> F["4 · Trade — order entry"]
    F --> G["5 · Monitor & reconcile — streams + webhooks"]
```

> [!NOTE]
>
> **Funding is in beta.** Your funding entity **pre-positions pooled funds** at Polymarket US and funds each participant's trading account with instant deposit transfers that mirror their wallet allocation, via [Partner Funding](https://docs.polymarket.us/partners/funding/overview.md), enabled per partner. There is no per-participant bank-deposit step in the journey.

## What you'll build

A complete partner integration has a handful of components. You can build them incrementally in the order below.

| Component | Purpose | Primary interface |
| - | - | - |
| **Auth client** | Authenticate as your Firm and refresh access tokens | [Private Key JWT](https://docs.polymarket.us/partners/get-connected/authentication.md) |
| **KYC flow** | Onboard and verify Retail Participants | [KYC](https://docs.polymarket.us/partners/onboarding/kyc/overview.md) |
| **Order entry** | Submit orders with declared vendor fees on behalf of participants | [Submitting Orders](https://docs.polymarket.us/partners/orders/create-order.md) *(Beta)* |
| **Funding** | Fund participant trading accounts and collect vendor fees | [Partner Funding](https://docs.polymarket.us/partners/funding/overview.md) *(Beta)* |
| **Stream consumers** | Maintain a live mirror of orders, positions, and balances | [gRPC streaming](https://docs.polymarket.us/streaming-endpoints/grpc-overview.md) |
| **Webhook receiver** | Receive KYC and account lifecycle notifications | Account notifications *(coming soon)* |

> [!NOTE]
>
> Polymarket US is a **streaming-first** platform. REST endpoints are intended for one-off queries and are rate-limited; continuous data should come from streams. Keep this in mind as you design every component above.

## Recommended reading order

**1. Understand the platform and your role**

Start with [Your Role](https://docs.polymarket.us/partners/your-role.md) and the [Platform Model](https://docs.polymarket.us/partners/platform-model.md). Keep the [Glossary](https://docs.polymarket.us/partners/glossary.md) open in a tab.

**2. Understand funding**

Your funding entity **pre-positions pooled funds** and funds participant accounts with instant deposit transfers, with vendor fees declared per order and collected periodically — read the [Partner Funding](https://docs.polymarket.us/partners/funding/overview.md) *(Beta)* model before designing your deposit, order, and fee flows. Contact your Polymarket US integration lead to enable funding for your integration.

**3. Get connected**

Complete partner [onboarding](https://docs.polymarket.us/partners/get-connected/onboarding.md), then set up [authentication](https://docs.polymarket.us/partners/get-connected/authentication.md). Confirm you can call `GET /v1/whoami` successfully.

**4. Onboard your participants**

Implement the [KYC flow](https://docs.polymarket.us/partners/onboarding/kyc/overview.md). You **collect** each participant's required information and submit it; Polymarket US **performs the verification and decision**. On approval, the Retail Participant and their [account](https://docs.polymarket.us/partners/onboarding/accounts.md) are provisioned automatically. See [Onboard Participants](https://docs.polymarket.us/partners/onboarding/users.md).

**5. Place your first order**

Walk through the [Quickstart](https://docs.polymarket.us/partners/get-connected/quickstart.md) to authenticate, list instruments, and place and cancel an order end to end.

**6. Monitor and reconcile**

Subscribe to the [order, position, and balance streams](https://docs.polymarket.us/streaming-endpoints/grpc-overview.md) and maintain a local mirror. Add a webhook receiver for KYC and account lifecycle events.

## Start here

> [card] [Your Role](https://docs.polymarket.us/partners/your-role.md)
>
> What you do, what we do, and what you never handle.

> [card] [Platform Model](https://docs.polymarket.us/partners/platform-model.md)
>
> DCM + DCO and the entities you act on.

> [card] [Authentication](https://docs.polymarket.us/partners/get-connected/authentication.md)
>
> Authenticate as your Firm with Private Key JWT.

> [card] [Quickstart](https://docs.polymarket.us/partners/get-connected/quickstart.md)
>
> Place your first order end to end.


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.