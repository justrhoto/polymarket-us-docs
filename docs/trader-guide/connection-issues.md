> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Connection Issues

> Troubleshooting network and connectivity problems

<Warning>
  **Connection drops are normal for HTTP/REST APIs.** Various infrastructure layers (load balancers, proxies, firewalls) have timeout limits. All API clients must implement automatic reconnection logic with exponential backoff - this is not optional.
</Warning>

## Required Client Implementation

All API clients must implement:

1. **Automatic reconnection** for both REST and gRPC when connections drop
2. **Retry logic** with exponential backoff for transient connection errors
3. **Keepalive configuration** for gRPC streams (60s interval recommended)
4. **Timeout detection** (15s for REST, 180s for stream silence)
5. **Connection pooling** with stale connection detection for REST
6. **Traffic activity** - don't leave connections idle for 10+ minutes

***

## ALB 10-Minute Timeout

### SocketError: "other side closed" every 10 minutes

**Cause**: Application Load Balancer (ALB) timeout, set to 10 minutes by design. If your connection has no activity for 10 minutes, the ALB will close it.

**Solution**: Implement automatic reconnection logic in your client. If you're not sending traffic for 10 minutes, your code should handle reconnect gracefully.

**Note**: The 10-minute timeout is intentional and will not be increased. Proper client implementation (connection pooling, keepalives, reconnection) is the correct solution.

***

## gRPC Connection Issues

### 14 UNAVAILABLE Errors

gRPC streams can drop with "14 UNAVAILABLE" errors for two reasons:

**(a) 10-minute ALB timeout**: If you create a gRPC channel but don't open a stream immediately, or if there's no actual traffic on the stream for 10 minutes, the ALB will timeout the connection.

**(b) Keepalives alone may not prevent timeout**: The ALB needs to see actual traffic, not just HTTP/2 PING frames.

**Solutions**:

* Implement automatic reconnection when streams drop (error code 14 or EOF)
* Open streams promptly after creating channels
* If you have long idle periods, consider periodic lightweight API calls to keep the connection active

### Recommended gRPC Keepalive Settings

```python theme={null}
# Python example
import grpc

channel = grpc.secure_channel(
    'grpc-preprod.polymarketexchange.com:443',
    grpc.ssl_channel_credentials(),
    options=[
        ('grpc.keepalive_time_ms', 60000),           # Send keepalive every 60s
        ('grpc.keepalive_timeout_ms', 20000),        # Wait 20s for keepalive response
        ('grpc.keepalive_permit_without_calls', 1),  # Send keepalives when idle
    ]
)
```

```javascript theme={null}
// Node.js example
const grpc = require('@grpc/grpc-js');

const channel = new grpc.ChannelCredentials.createSsl();
const client = new YourServiceClient(
  'grpc-preprod.polymarketexchange.com:443',
  channel,
  {
    'grpc.keepalive_time_ms': 60000,
    'grpc.keepalive_timeout_ms': 20000,
    'grpc.keepalive_permit_without_calls': 1
  }
);
```

**Note**: Keepalives help detect broken connections, but they may not prevent ALB timeouts if there's no actual API traffic for 10+ minutes.

### Stream Goes Dark (No Heartbeat for >180 Seconds)

**Cause**: Connections being severed on the hosts. Recent infrastructure fixes should have resolved this issue.

**Solution**: Implement 180-second timeout detection on your end. Trigger automatic reconnection when no data received for 180+ seconds. This error should be rare after recent stability improvements.

***

## REST Connection Errors

### ECONNRESET, EPIPE, "other side closed"

**Cause**: Transient network issues, stale connections, or load balancer timeouts.

**Solution**: Implement exponential backoff with 2-3 retries for connection errors:

```python theme={null}
import time
import requests
from requests.exceptions import ConnectionError

def make_request_with_retry(url, headers, data, max_retries=3):
    for attempt in range(max_retries):
        try:
            return requests.post(url, headers=headers, json=data, timeout=15)
        except ConnectionError as e:
            if attempt == max_retries - 1:
                raise
            wait_time = 2 ** attempt  # 1s, 2s, 4s
            time.sleep(wait_time)
```

### Stale Connection Handling

Configure your HTTP client's connection pool to detect and remove closed connections before reuse:

```python theme={null}
# Python with requests
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

session = requests.Session()
retry = Retry(
    total=3,
    backoff_factor=1,
    status_forcelist=[502, 503, 504],
    allowed_methods=["GET", "POST"]
)
adapter = HTTPAdapter(max_retries=retry, pool_connections=10, pool_maxsize=20)
session.mount('https://', adapter)
```

```javascript theme={null}
// Node.js with Undici
const { Pool } = require('undici');

const pool = new Pool('https://api.preprod.polymarketexchange.com', {
  connections: 10,
  pipelining: 1,
  keepAliveTimeout: 60000,
  keepAliveMaxTimeout: 600000
});
```

### Request Timeouts

**Recommendation**: Add 15-second timeouts on client side to prevent hanging requests. A small percentage of calls may never resolve - timeout protection is essential.

```python theme={null}
# Python
response = requests.post(url, json=data, timeout=15)
```

```javascript theme={null}
// Node.js with fetch
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 15000);

const response = await fetch(url, {
  signal: controller.signal,
  headers: headers,
  body: JSON.stringify(data)
});
clearTimeout(timeoutId);
```

***

## Connection Best Practices

### Use Batch Endpoints

Batch endpoints reduce overall connection load significantly:

* `/v1/trading/orders/list` - Retrieve multiple orders at once
* `/v1/trading/orders/cancel/list` - Cancel multiple orders in one call

### Implement Connection Pooling

* Reuse connections across requests
* Configure appropriate pool sizes for your traffic patterns
* Ensure stale connections are detected and recycled

### Avoid Creating Idle Connections

* Don't create gRPC channels or HTTP connections unless you're actively using them
* If you need to maintain a connection, ensure regular traffic (not just keepalives)

***

## Timeout / No Response

If requests hang without returning a response:

### Step 1: Verify Your Token

Ensure your access token is valid and not expired:

```python theme={null}
import base64
import json

# Decode the payload (middle part of JWT)
payload = access_token.split('.')[1]
payload += '=' * (4 - len(payload) % 4)  # Add padding
claims = json.loads(base64.urlsafe_b64decode(payload))

print("Token expires:", claims.get("exp"))
print("Granted scopes:", claims.get("scope", ""))
```

### Step 2: Check Endpoint URL

Ensure you're using the correct API base URL for your environment:

| Environment    | API Base URL                                 |
| -------------- | -------------------------------------------- |
| Pre-production | `https://api.preprod.polymarketexchange.com` |
| Production     | `https://api.prod.polymarketexchange.com`    |

### Step 3: Verify Network Connectivity

Test basic connectivity to the API:

```bash theme={null}
curl -I https://api.preprod.polymarketexchange.com/v1/health
```

Expected response: `{"status":"ok"}` with HTTP 200.

## Error 464

When receiving a 464 error in prod or pre-prod environments, verify that the `Host` header is set correctly:

```bash theme={null}
Host: api.preprod.polymarketexchange.com
```

**OR**

```bash theme={null}
Host: api.prod.polymarketexchange.com
```

Without the correct host header, requests may be routed incorrectly.

## Connection Reset / Connection Refused

This indicates network-level issues before reaching the API:

**Possible causes:**

1. **DNS resolution failure** - Check that `api.{env}.polymarketexchange.com` resolves correctly
2. **TLS handshake failure** - Your client may not support required TLS version (TLS 1.2+)
3. **Firewall blocking** - Your network may block outbound HTTPS
4. **IP address blocked** - Your IP may be blocked for suspicious activity

**Test connectivity:**

```bash theme={null}
curl -v https://api.{env}.polymarketexchange.com/v1/health
```

The `-v` flag shows connection details to help identify where the failure occurs.

## Curl Command Issues

### Drops to Blinking Cursor

If your curl command drops to a new line with a blinking cursor, this indicates a formatting issue with the command itself, not a connection problem.

**Common causes:**

* Missing quotation marks
* Missing escape characters
* Malformed command syntax

**Example of correct curl formatting:**

```bash theme={null}
curl -X POST https://api.preprod.polymarketexchange.com/v1/trading/orders \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "instrument": "tec-nfl-sbw-2026-02-08-kc",
    "side": "buy",
    "quantity": 100
  }'
```

## Platform-Specific Issues

### Windows and Python HTTP/2

Windows instances and Python applications may encounter HTTP/2 compatibility issues:

**Windows**: Ensure HTTP/2 is enabled in your system settings.

**Python**: Use the `httpx` library instead of `requests`:

```python theme={null}
import httpx

# Use httpx for HTTP/2 support
with httpx.Client(http2=True) as client:
    response = client.get(
        "https://api.preprod.polymarketexchange.com/v1/health",
        headers={"Authorization": f"Bearer {token}"}
    )
```

### HTTP/2 vs HTTP/1.1

Both protocols are supported:

* **HTTP/2**: Better performance for multiple concurrent requests
* **HTTP/1.1**: Works fine for most use cases

If you encounter issues with HTTP/2, you can force HTTP/1.1 in most HTTP clients.

## SSL/TLS Issues

### Certificate Verification Failures

If you receive SSL certificate verification errors:

**In production code**: Never disable certificate verification. This creates security vulnerabilities.

**For debugging only**: You can temporarily disable verification to test connectivity:

```python theme={null}
# DEBUGGING ONLY - DO NOT USE IN PRODUCTION
import requests
response = requests.get(url, verify=False)
```

**Proper solution**: Ensure your system has up-to-date CA certificates installed.

## Proxy and Firewall

### Behind a Corporate Proxy

If you're behind a corporate proxy:

```bash theme={null}
# Set proxy environment variables
export HTTP_PROXY=http://proxy.example.com:8080
export HTTPS_PROXY=http://proxy.example.com:8080

# Or in Python
proxies = {
    'http': 'http://proxy.example.com:8080',
    'https': 'http://proxy.example.com:8080',
}
response = requests.get(url, proxies=proxies)
```

### Firewall Restrictions

Ensure your firewall allows outbound HTTPS connections to:

* `*.polymarketexchange.com` on port 443
* `*.auth0.com` on port 443 (for authentication)

## DNS Issues

### Cannot Resolve Hostname

Test DNS resolution:

```bash theme={null}
nslookup api.preprod.polymarketexchange.com
# or
dig api.preprod.polymarketexchange.com
```

If DNS fails, check:

1. Your DNS server configuration
2. Whether you can resolve other domains
3. Whether there's a local hosts file override

## Health Check Endpoint

Use the health check endpoint to verify API availability:

```bash theme={null}
curl https://api.{env}.polymarketexchange.com/v1/health
```

**Expected response**: `{"status":"ok"}` with HTTP 200

**No authentication required** - this endpoint is publicly accessible.

If the health check fails, the API may be experiencing issues. Check the [status page](https://status.polymarketexchange.com) or contact support.
