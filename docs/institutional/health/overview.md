> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Health API Overview

> Service health check endpoint

## Endpoints

| Method | Endpoint     | Description                 |
| ------ | ------------ | --------------------------- |
| `GET`  | `/v1/health` | Check service health status |

<Info>
  **No Authentication Required**

  The health check endpoint is publicly accessible and does not require authentication. This allows monitoring systems to verify service availability without credentials.
</Info>

## When to Use

| Use Case                        | Description                                                   |
| ------------------------------- | ------------------------------------------------------------- |
| **Service Monitoring**          | Check if the API is online and responding                     |
| **Pre-flight Checks**           | Verify connectivity before starting trading operations        |
| **Load Balancer Health Checks** | Configure external load balancers to monitor API availability |
| **Uptime Monitoring**           | Set up automated alerts for service outages                   |

## Response Format

The health check returns a simple JSON response indicating the service status:

```json theme={null}
{
  "status": "ok"
}
```

| Field    | Description                        |
| -------- | ---------------------------------- |
| `status` | Service status (`ok` when healthy) |

## Example Usage

### Check Service Health

```bash theme={null}
curl https://api.preprod.polymarketexchange.com/v1/health
```

### Production Health Check

```bash theme={null}
curl https://api.prod.polymarketexchange.com/v1/health
```

<Tip>
  **Quick Links**

  Test the health endpoint for each environment:

  * [Preprod Health Check](https://api.preprod.polymarketexchange.com/v1/health)
  * [Production Health Check](https://api.prod.polymarketexchange.com/v1/health)
</Tip>

## Integration Examples

### Monitoring Script

```python theme={null}
import requests
import time

def check_health(base_url):
    try:
        response = requests.get(f"{base_url}/v1/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Service is {data['status']}")
            return True
        else:
            print(f"✗ Unexpected status code: {response.status_code}")
            return False
    except Exception as e:
        print(f"✗ Health check failed: {e}")
        return False

# Check preprod environment
check_health("https://api.preprod.polymarketexchange.com")
```

### Kubernetes Liveness Probe

```yaml theme={null}
livenessProbe:
  httpGet:
    path: /v1/health
    port: 443
    scheme: HTTPS
  initialDelaySeconds: 30
  periodSeconds: 10
  timeoutSeconds: 5
  failureThreshold: 3
```

### Docker Health Check

```dockerfile theme={null}
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD curl -f https://api.preprod.polymarketexchange.com/v1/health || exit 1
```
