> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# FIX Connection Setup

FIX connectivity to Polymarket US is provisioned via AWS VPC PrivateLink. After your [onboarding](/trader-guide/onboarding) is complete, you will receive your connection details in the FIX Connectivity form:

<Card title="Download FIX Connectivity Form" icon="download" href="https://drive.google.com/uc?export=download&id=1z-DxC8m-wUZKQq8S7tV64Rwi-WTMIps0">
  Template form for FIX session configuration and connection details
</Card>

***

## AWS VPC Connection Setup

Connecting to Polymarket Exchange FIX services from your AWS VPC involves adding VPC Endpoints to your VPC's private subnets. You will need to have at least one (preferably 3) subnets in the Availability Zone IDs that are supported by the Polymarket environment you are connecting to.

<Warning>
  AWS randomly maps Availability Zones to physical Zone IDs per account. Please verify that the Zone IDs match. [Learn more about Availability Zones](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-regions-availability-zones.html#concepts-availability-zones).
</Warning>

### Supported AWS Availability Zone IDs

| Environment        | Zone IDs                     |
| ------------------ | ---------------------------- |
| **Production**     | use1-az1, use1-az2, use1-az6 |
| **Pre-Production** | use1-az1, use1-az2, use1-az4 |

<Tip>
  We strongly recommend using separate AWS accounts to clearly distinguish between your production and non-production sessions.
</Tip>

### Creating a VPC Endpoint

In your AWS Console, create a new VPC Endpoint using the VPC Service Name provided to you based on the specific environment you want to connect to.

#### 1. Navigate to the VPC Console

1. Open the Amazon VPC console in the AWS Management Console
2. In the navigation pane, choose **Endpoints**
3. Choose **Create endpoint**

#### 2. Configure the Endpoint Settings

* (Optional) For **Name tag**, enter a descriptive name for your endpoint
* For **Service category**, select **Endpoint services that use NLBs and GWLBs**
* For **Service name**, enter the exact service name provided to you and choose **Verify service**
* For **VPC**, select the VPC from which you will access the service
* For **IP address type**, choose **IPv4**

#### 3. Configure Subnets and Security

* For **Subnets**, select one subnet per Availability Zone where you want to create an endpoint network interface. For high availability, select at least two AZs
* For **Security Group**, select a security group that allows inbound traffic from the resources in your VPC that need to access the service on the required ports

#### 4. Connection Approval

Once you've created the VPC Endpoint, a connection request will be sent to Polymarket. Our DevOps team will review and accept the request, and we will notify you once it has been approved.

<Note>
  You will not be able to proceed with DNS configuration or FIX connection until we've accepted the connection on our end.
</Note>

#### 5. Enable Private DNS

After connecting to the endpoint, enable Private DNS for the endpoint. When Private DNS is enabled, the DNS names provided to you will resolve to private IP addresses assigned to your VPC Endpoint, and all traffic will route over the private AWS network.

***

## Retrieving Your VPC Endpoint DNS Name

<Note>
  It is recommended to use the DNS name provided to you and not the AWS-generated DNS names assigned to your VPC Endpoint.
</Note>

To connect to the VPC Endpoint Service, you can use the AWS-assigned DNS name generated within your account, or the Private DNS described above. If you choose the AWS-assigned DNS name, it will continue to work independent of the Private DNS.

### Option 1: Using the AWS Management Console

1. Log in to your AWS account and navigate to the [VPC Console](https://console.aws.amazon.com/vpc/)
2. In the left navigation pane, select **Endpoints**
3. Select the Interface Endpoint you created for this service (search by the Service Name if needed)
4. In the **Details** tab at the bottom of the screen, locate the **DNS names** section
5. Copy the first entry listed (the Regional DNS Name)

<Warning>
  Do not use the zonal DNS names (the ones containing availability zone letters like .us-east-1a.) unless you are specifically targeting a single zone.
</Warning>

### Option 2: Using the AWS CLI

If you have the AWS CLI configured, run the following command to retrieve the DNS names directly:

```bash theme={null}
aws ec2 describe-vpc-endpoints \
    --filters Name=service-name,Values=[VPC_SERVICE_NAME] \
    --query "VpcEndpoints[0].DnsEntries[*].DnsName" \
    --output text
```

Replace `[VPC_SERVICE_NAME]` with the VPC Service name that was provided to you for the initial creation of the VPC Endpoints. You can also run this in CloudShell from the AWS Web Console.

***

## FIX Session Configuration

### Session Identifiers

Your FIX engine will initiate the TCP connection sessions to Polymarket Exchange using FIXT.1.1 transport with FIX 5.0 SP2 application messages. Identifiers can include ASCII printable characters excluding SOH (Start of Header) characters only.

**SenderCompID (Tag 49):**
The firm ID assigned by Polymarket to your firm's FIX session (e.g., `YOURFIRM_PMX_OE`, `YOURFIRM_PMX_MD`, `YOURFIRM_PMX_DC`)

**TargetCompID (Tag 56):**
The exchange ID assigned by Polymarket to your firm's FIX session (e.g., `PMX_YOURFIRM_OE`, `PMX_YOURFIRM_MD`, `PMX_YOURFIRM_DC`)

**SenderSubID (Tag 50):**
The trader identifier assigned based on the user we create at Polymarket (e.g., `20251118-yourfirm-api-user-1`), sent on order and order-management messages

**Account (Tag 1):**
The account identifier assigned based on the account we create at Polymarket (e.g., `20251118-yourfirm-api-account-1`), sent on orders to attribute trading activity

### Session Types

Polymarket Exchange provides three types of FIX sessions:

| Session Type         | Purpose                        | Port                           |
| -------------------- | ------------------------------ | ------------------------------ |
| **Order Entry (OE)** | Submit and manage orders       | Provided in connection details |
| **Market Data (MD)** | Subscribe to market data feeds | Provided in connection details |
| **Drop Copy (DC)**   | Receive execution reports      | Provided in connection details |

### Sequence Number Reset

<Note>
  Each participant's FIX session can have a different sequence reset time (e.g., 00:00:00 UTC, 00:00:00 ET). Your configured reset time will be provided in your connection details.
</Note>

***

## Testing Your Connection

Once your VPC Endpoint is approved and configured:

1. Test connectivity to each port (Order Entry, Market Data, Drop Copy)
2. Initiate FIX sessions using the identifiers provided
3. Verify sequence number behavior and message flow
4. Test order submission and market data subscriptions

For detailed FIX protocol specifications, see:

* [FIX Session Management](/institutional/fix-api/fix-session-management)
* [FIX Order Entry](/institutional/fix-api/fix-order-entry-overview)
* [FIX Market Data](/institutional/fix-api/fix-market-data-subscription)
