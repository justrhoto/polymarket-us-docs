> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# REST/gRPC vs FIX

> Understanding the differences between REST/gRPC and FIX APIs

## Architecture

### REST/gRPC is Internet-Native

* Public API accessible over HTTPS
* Authentication is Private Key JWT (RSA key signatures → access token)
* Secured cryptographically (private key signatures), not by network location
* No VPC, PrivateLink, or IP allowlisting required
* Designed for stateless, elastic, internet-style clients

### FIX is Exchange-Native

* Traffic terminates on dedicated FIX gateways via AWS PrivateLink
* Access is gated by AWS account allowlisting
* Authentication is FIX session identity (SenderCompID / TargetCompID / SenderSubID)
* Designed for long-lived, stateful connections with known counterparties

REST/gRPC relies on cryptographic identity (RSA signatures and JWTs). FIX relies on network-level trust (AWS account allowlisting via PrivateLink) + session semantics. They run on different infrastructure layers and intentionally use different trust models.

***

## Concept Mapping

This table shows how the same concepts are represented in REST/gRPC vs FIX:

| Concept            | REST/gRPC            | FIX               |
| ------------------ | -------------------- | ----------------- |
| Firm / participant | Implicit via login   | SenderCompID (49) |
| Exchange           | REST base URL        | TargetCompID (56) |
| User / trader      | Logged-in user       | SenderSubID (50)  |
| Trading account    | Implicit             | Account (1)       |
| Instrument         | Symbol               | Symbol (55)       |
| Client order ID    | Client-generated ID  | ClOrdID (11)      |
| Exchange order ID  | Returned in response | OrderID (37)      |
| Side               | buy / sell           | Side (54)         |
| Order type         | JSON field           | OrdType (40)      |
| Quantity           | JSON field           | OrderQty (38)     |
| Price              | JSON field           | Price (44)        |
| Time in force      | JSON field           | TimeInForce (59)  |

***

## Authentication

### REST/gRPC

Authentication is cryptographic and passwordless. User and account context is implicit once authenticated.

Users authenticate by:

1. Generating an RSA key pair during onboarding
2. Signing a JWT with their private key
3. Exchanging the signed JWT for an access token from Auth0
4. Using the access token in API requests

### FIX

User and account context is explicit per order. FIX does not use JWTs or passwords.

Authentication is based on:

1. AWS account allowlisting via PrivateLink
2. FIX session identity (SenderCompID, TargetCompID)

***

## Identity Model

**REST/gRPC** infers user + account from login. **FIX** requires them to be sent on every order.

| Concept         | REST/gRPC          | FIX               |
| --------------- | ------------------ | ----------------- |
| Firm identity   | Implicit via login | SenderCompID (49) |
| User / trader   | Login user         | SenderSubID (50)  |
| Trading account | Implicit           | Account (1)       |
| Auth scope      | Session token      | FIX session       |

In FIX, the session itself (SenderCompID / TargetCompID) uniquely identifies the participant firm/clearing member, so symbols, accounts, and trader IDs do not need globally unique, fully qualified names the way REST resources do.

**REST/gRPC**: Uses globally unique, fully qualified resource names (e.g., `firms/{id}/accounts/{id}`)

**FIX**: Fully qualified names are not required; participant identity is scoped by the FIX session (CompIDs), and identifiers only need to be unique within that session context

***

## Connectivity

### REST/gRPC

HTTPS (REST) / HTTP streaming (gRPC). No static IP requirement. No VPC or network allowlisting. Public internet access. Single endpoint per environment.

### FIX

TCP FIXT.1.1. Static IP allowlisting required. Separate sessions for:

* Order Management
* Drop Copy
* Market Data

***

## State & Reliability

| Area       | REST/gRPC        | FIX                     |
| ---------- | ---------------- | ----------------------- |
| Transport  | Request/response | Persistent session      |
| Sequencing | Not required     | Mandatory (MsgSeqNum)   |
| Recovery   | Client retries   | ResendRequest / GapFill |
| Heartbeats | Not applicable   | Required                |

***

## Permissions & Validation

### REST/gRPC

Permissions enforced at login. Invalid actions rejected at API layer.

### FIX

Permissions enforced at:

1. Session level
2. User level (SenderSubID)
3. Account level (Account)

Invalid values cause order-level rejects.

***

## Onboarding

### REST/gRPC

Self-service after initial onboarding, no network infrastructure required, cryptographically secured (RSA signatures), public internet access.

1. Generate RSA key pairs for each environment
2. Submit onboarding request via Google Drive to [onboarding@polymarket.us](mailto:onboarding@polymarket.us) with public keys and signed Individual or Entity Participant Agreement
3. Receive Client ID credentials from Polymarket
4. Sign JWTs with private key to obtain access tokens
5. Fund account via wire transfer (production only)

### FIX

Requires AWS account and VPC setup, coordinated provisioning with exchange, uses AWS PrivateLink for private network connectivity, suited for automated trading systems and high-throughput integrations.

1. Download and complete Individual or Entity Participant Agreement
2. If you want FIX access, indicate it and include your AWS account ID on your application
3. Receive connection details from Polymarket (VPC Service Names, FIX session identifiers, user/account IDs, connection ports and DNS endpoints)
4. Create AWS VPC Endpoint and wait for Polymarket to accept connection request
5. Configure Private DNS and test FIX sessions (Logon, Orders, Market Data, Drop Copy)

***

## Operational Differences

| Area            | REST/gRPC   | FIX                       |
| --------------- | ----------- | ------------------------- |
| Who can onboard | Any user    | Exchange + client         |
| Network setup   | None        | Required                  |
| Identity setup  | Automatic   | Manual                    |
| Failure modes   | HTTP errors | Session / sequence errors |
