> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Onboarding

> Get started with the Polymarket Exchange API

> [!NOTE]
>
> **Individual traders:** You do not need to complete this onboarding process. See the [Quickstart](https://docs.polymarket.us/getting-started/quickstart.md) to get started.

Every entity that will transact completes a one-time application in the [Polymarket Institutional portal](https://institutional.polymarketexchange.com/register). The portal walks you through setting up the credentials you need to access the API across each environment (development, pre-production, and production).

## Step 1: Register

Create your account through the [Polymarket Institutional registration portal](https://institutional.polymarketexchange.com/register) with your organization name and work email. If your entity already has access, sign in instead.

The person who registers becomes your firm's admin for the portal. Choose someone who will manage the account day to day, such as a member of your operations team, rather than an individual trader.

To give other people at your firm their own portal logins, ask your Polymarket contact. Polymarket sends each person an invite to set up their access.

## Step 2: Choose Your Account and Participant Type

In **Getting Started**, select:

* **Institutional Account Type:** select **Entity**. You can also declare an exemption from CIP collection here. Most entities are not exempt.
* **Participant Type:** Market Maker, Hedge Fund, FCM, Introducing Broker, or Retail Website (ISV). Introducing brokers that arrange [block trades](https://docs.polymarket.us/trader-guide/block-trading.md) select **Introducing Broker**.
* **Expected Monthly Volume**
* **Technical Access Method:** whether you need the FIX API.

Your participant type determines which sections of the application you see.

### API-Specific Requirements

> [accordion] REST / gRPC
>
> No additional setup is required beyond registering through the portal.

> [accordion] FIX
>
> If you intend to use the FIX API, select **Yes** under **Technical Access Method** and enter your 12-digit **AWS Account ID** so that a VPC PrivateLink connection can be established.
>
> You should still complete registration even if FIX is your primary connectivity method, as it is required for full platform functionality.

## Step 3: Complete the Application

Introducing brokers complete a shorter application:

| Section | Standard application | Introducing Broker |
| - | :-: | :-: |
| Getting Started | ✓ | ✓ |
| Entity Information | ✓ | ✓ |
| Registered Address | ✓ | ✓ |
| Compliance | ✓ | ✓ |
| Entity Ownership Info | ✓ | |
| Beneficial Owners | ✓ | |
| Control Person | ✓ | |
| Authorized Persons | ✓ | |
| Documents | ✓ | ✓ |
| Preview | ✓ | ✓ |
| Submit | ✓ | ✓ |

In the standard application:

* **Entity Ownership Info** is needed only if another entity owns your entity, directly or indirectly. Otherwise, skip it.
* **Beneficial Owners:** add each individual who owns 25% or more of the entity, or confirm that there are none.
* Entities with a CIP exemption may not see the ownership, beneficial owner, or control person sections, depending on their exemption category.

### Definitions

| Term | Definition |
| - | - |
| **Authorized Person** | Any natural person authorized to place orders on behalf of the entity, such as an employee or an advisor authorized to trade on its behalf. |
| **Beneficial Owner** | Any individual who directly or indirectly owns or controls 25% or more of the entity. |
| **Control Person** | A person with the power to exercise a controlling influence over the entity's management or policies. Owning, directly or indirectly, more than 20% of the voting power is presumed to be control, absent a determination otherwise. |

### What to Prepare

> [tab] Standard application
>
> **Documents**
>
> * **Participant Agreement** (Entity Participant and Clearing Member Agreement). Download it from the Documents section of the application. Make sure both page 9 and page 12 are signed.
> * **Articles of Incorporation**, issued by the state (US entities) or by the government (non-US entities)
> * **Certificate of Good Standing**, issued by the state (US entities) or by the government (non-US entities) within the last year
> * **W-9**, using the entity's TIN rather than a personal SSN or national ID. Non-US entities submit a W-8BEN-E instead.
>
> **Entity details**
>
> * Legal name, email, and phone number
> * Registered address
> * Compliance details: form of organization, tax ID, ECP status, and LEI, NFA registration ID, and swap dealer, MSP, FCM, or IB status where applicable
>
> **People**
>
> * Owning entities, if another entity owns yours
>
> * Beneficial owners (25% or more ownership)
>
> * Control person
>
> * Authorized persons
>
> > [!NOTE]
> >
> > For each beneficial owner and the control person, the application asks for a date of birth and an ID number, such as an SSN or passport number. During review, Polymarket may also request additional information for authorized persons, such as a date of birth and SSN or passport details.

> [tab] Introducing Broker
>
> **Documents**
>
> * **IB Participation Agreement - Block Trades.** Download it from the Documents section of the application, then upload the signed copy.
>
> **Entity details**
>
> * Legal name, email, and phone number
> * Registered address
> * Compliance details: form of organization, tax ID, ECP status, and LEI, NFA registration ID, and swap dealer, MSP, FCM, or IB status where applicable

Upload each required document as a PDF. Files are scanned before they become available. You can't submit until every required document is uploaded.

## Step 4: Submit for Review

Review your answers in **Preview**, then select **Submit Application**. Review typically takes 1–3 business days.

While your application is under review, the onboarding team checks it for completeness and confirms your entity's eligibility, including its Eligible Contract Participant (ECP) status. ECP status also determines which screens and permissions the entity can access. You can edit and resubmit your application during review.

Before approval, an entity can only view and update its own application. After approval, it can access the screens it is permissioned for, which may include Wires and Connectivity & Keys.

## Step 5: Receive Your Credentials

The Polymarket team will review your submission and provide your Client ID credentials for both pre-production and production environments.

If you requested FIX connectivity, you will also receive your FIX connection details. See [FIX Connection Setup](https://docs.polymarket.us/institutional/fix-api/fix-connection-setup.md) for VPC endpoint configuration and session setup.

## Step 6: Fund Your Account

Your pre-production account will be funded with dummy funds for testing purposes. To begin trading on the production environment, fund your account by wire transfer. Funds are typically available for trading the same day to 2 business days after receipt.

## Additional Accounts

After approval, you can open additional trading accounts for your firm from the **Accounts** screen in the portal.


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.