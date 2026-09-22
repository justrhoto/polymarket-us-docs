> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Drop Copy Configurations

## Fills Only Mode

For participants who only need fill notifications (not the complete order lifecycle), the drop copy session can be configured in "fills only" mode. When enabled:

* Only ExecutionReport messages with **ExecType = F (Trade)** are sent
* Order acknowledgements, cancellations, modifications, and rejections are not included
* Reduces message volume for participants focused solely on trade reconciliation

To enable fills only mode, request this configuration when setting up your drop copy session with the exchange operator.

***

## Comparing FIX Drop Copy vs gRPC DropCopy

Polymarket Exchange offers drop copy feeds via both FIX and gRPC protocols:

| Feature                | FIX Drop Copy                | gRPC DropCopy           |
| ---------------------- | ---------------------------- | ----------------------- |
| **Protocol**           | FIX 5.0 SP2                  | gRPC streaming          |
| **Message Format**     | FIX tag-value                | Protobuf                |
| **Session Management** | FIX logon/logout             | gRPC connection         |
| **Reconnection**       | FIX resend                   | Resume tokens           |
| **Use Case**           | Traditional FIX integrations | Modern API integrations |

Choose FIX Drop Copy if you have existing FIX infrastructure. Choose gRPC if you prefer modern streaming APIs with protobuf messages.

<Tip>
  For more information on gRPC DropCopy streaming, see the [DropCopy Stream](/streaming-endpoints/dropcopy-stream) documentation.
</Tip>
