> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Health Check

> Monitor API service status

The Health Check endpoint allows you to verify the API service status before making trading requests.

## Endpoint

| Method | Endpoint     | Description                 |
| ------ | ------------ | --------------------------- |
| `GET`  | `/v1/health` | Check service health status |

## Request

```bash theme={null}
curl -X GET "https://api.prod.polymarketexchange.com/v1/health"
```

No authentication is required for the health check endpoint.

## Response

```json theme={null}
{
  "status": "ok"
}
```

### Response Fields

| Field    | Type   | Description                        |
| -------- | ------ | ---------------------------------- |
| `status` | string | Service status (`ok` when healthy) |

## Use Cases

### Pre-flight Check

Before initiating trading operations, verify the API is healthy:

```python theme={null}
import requests

def check_health():
    response = requests.get("https://api.prod.polymarketexchange.com/v1/health")
    if response.status_code == 200 and response.json().get("status") == "ok":
        return True
    return False

if check_health():
    # Proceed with trading operations
    pass
else:
    # Handle service unavailability
    pass
```

### Monitoring

Use the health endpoint for:

* **Load balancer health checks** - Configure your load balancer to poll this endpoint
* **Alerting systems** - Set up alerts when the endpoint fails
* **Dashboard status** - Display real-time service status in your application

## Best Practices

1. **Don't over-poll** - Check health at reasonable intervals (e.g., every 30 seconds)
2. **Implement retry logic** - Transient failures can occur; retry before alerting
3. **Cache results** - Don't check health before every API call
4. **Handle gracefully** - If health check fails, queue operations and retry later
