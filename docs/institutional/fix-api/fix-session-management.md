> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# FIX Session Management

## Establishing and Maintaining a FIX Session

The Logon \[A] message initiates a connection to the Polymarket US. FIX sessions are typically initiated by customers (as opposed to the exchange platform), and can be made any time.

**Important: Logon \[A] messages must NOT specify a SenderSubID \[50] in the header. Sending this tag will cause the logon attempt to be rejected.**

### Table 4: Logon (A) message

<table>
  <thead>
    <tr>
      <th width="80">Tag</th>
      <th width="200">Name</th>
      <th width="50">Req</th>
      <th width="100">Type</th>
      <th>Description</th>
    </tr>
  </thead>

  <tbody>
    <tr><td>\< Standard Header ></td><td /><td>Y</td><td /><td>35 = A</td></tr>
    <tr><td>98</td><td>EncryptMethod</td><td>Y</td><td>int</td><td>Encrypted messages are not supported. 0=None</td></tr>
    <tr><td>108</td><td>HeartBtInt</td><td>Y</td><td>int</td><td>A 30-second interval is recommended</td></tr>
    <tr><td>141</td><td>ResetSeqNumFlag</td><td>Y</td><td>Boolean</td><td>Indicates both sides of a FIX session should reset sequence numbers back to 1 during a normal end of session (and not due to an unintended disconnect). Recommended</td></tr>
    <tr><td>1137</td><td>DefaultApplVerID</td><td>Y</td><td>String</td><td>Specifies the FIX 5.0 service pack release being applied. 9=FIX50SP2</td></tr>
    <tr><td>\< Standard Trailer ></td><td /><td>Y</td><td /><td /></tr>
  </tbody>
</table>

<br />

**Example 1: Logon message**

```
8=FIXT.1.1 | 9=76 | 35=A | 49=SENDER | 56=TARGET | 34=1 | 52=20240516-14:14:53 | 98=0 | 108=30 | 1137=9 | 141=Y | 10=132 |
```

<br />

### Figure 1: Successful Logon

![](https://files.readme.io/688c178-logon.png)

Under normal circumstances, both FIX engines on either side of the connection will regularly exchange Heartbeat messages. The frequency of such a message exchange is determined by the HeartBtInt (108) value indicated in the Logon \[A] message.

Regular application messages qualify as a heartbeat, i.e both sides of the connection are behaving nominally if a message is received during the HeartBtInt (108).  If no application messages are received during the interval, the Heartbeat \[0] message is used as described below.

<br />

### Table 5: Heartbeat (0) message

<table>
  <thead>
    <tr>
      <th width="80">Tag</th>
      <th width="200">Name</th>
      <th width="50">Req</th>
      <th width="100">Type</th>
      <th>Description</th>
    </tr>
  </thead>

  <tbody>
    <tr><td>\< Standard Header ></td><td /><td>Y</td><td /><td>35 = 0 (zero)</td></tr>
    <tr><td>112</td><td>TestReqID</td><td>N</td><td>String</td><td>Required when the heartbeat is the result of a TestRequest \[1] message</td></tr>
    <tr><td>\< Standard Trailer ></td><td /><td>Y</td><td /><td /></tr>
  </tbody>
</table>

At any point either counterparty can force the opposing FIX engine to send a Heartbeat \[0] message by submitting a TestRequest \[1] message containing a TestReqID (112) value, which should be echoed in the Heartbeat \[0] response.

### Table 6: TestRequest (1) message

<table>
  <thead>
    <tr>
      <th width="80">Tag</th>
      <th width="200">Name</th>
      <th width="50">Req</th>
      <th width="100">Type</th>
      <th>Description</th>
    </tr>
  </thead>

  <tbody>
    <tr><td>\< Standard Header ></td><td /><td>Y</td><td /><td>35 = 1</td></tr>
    <tr><td>112</td><td>TestReqID</td><td>Y</td><td>String</td><td>ID to be returned in the resulting Heartbeat \[0] response</td></tr>
    <tr><td>\< Standard Trailer ></td><td /><td>Y</td><td /><td /></tr>
  </tbody>
</table>

### Figure 2: Using TestRequest \[1] to request Heartbeat \[0] from other side

![](https://files.readme.io/6dc3db8-test_request.png)

## Cancel on Disconnect

Cancel on Disconnect is an optional feature which can act as an automatic risk control for participants in the event that application connectivity is lost for any reason, from network error to graceful logout.

In these circumstances, the exchange will automatically cancel all open (unexecuted) DAY orders for the Participant while GTC and GTD orders continue to rest.

Note that a network-level disconnect instantly triggers this Cancel on Disconnect functionality in the FIX gateway.

After reconnecting, missed messages will be replayed including execution reports for any canceled orders or in-flight fills. It is the FIX client's responsibility to re-enter any orders cancelled by COD feature, if they choose to based on market conditions when connectivity is re-established.

Cancel on Disconnect is disabled by default, and enabled on a session-by-session basis in the FIX configurations. The below example shows two sessions, one with CancelOnDisconnect=Y and one with CancelOnDisconnect=N which puts the participant at more risk of in-flight fills.

```yaml theme={null}
fixConf: |-
  [DEFAULT]
  ConnectionType=acceptor
  SocketAcceptPort=13001
  BeginString=FIXT.1.1
  DefaultApplVerID=9
  SenderCompID=EP3
  StartDay=Sunday
  StartTime=16:45:01
  EndDay=Sunday
  EndTime=16:45:00
  TimeZone=America/Chicago
  [SESSION]
  ClearingMemberFirm=firms/Clearing-Member-1
  Firm=firms/Trading-Firm-A
  TargetCompID=TFA
  CancelOnDisconnect=Y
  ResetOnLogon=Y
  [SESSION]
  ClearingMemberFirm=firms/Clearing-Member-1
  Firm=firms/Trading-Firm-B
  TargetCompID=TFB
  CancelOnDisconnect=N
  ResetOnLogon=Y
```

## Cancel on Logout

Cancel on Logout is an optional feature that cancels working DAY orders on a FIX session logout. This functionality is similar to Cancel on Disconnect in that it cancels working DAY orders, but differs in that it triggers due to a logout for any reason.

Note this feature cancels working orders when a session disconnects for any reason, including unsolicited disconnects as well as clean logouts. Cancel on Disconnect will only trigger on a network disconnection (with no preceding FIX logout message) whereas Cancel on Logout will trigger for that case in addition to the graceful FIX logout flow as initiated by either the acceptor or initiator.

If you only want to cancel when an unexpected connection interruption is detected, instead use Cancel on Disconnect.

The example below shows how CancelOnLogout can be enabled while CancelOnDisconnect is disabled. In this example, orders for TargetCompID=TFA will cancel only on a network error (CancelOnDisconnect) whereas TargetCompID=TFB will cancel on any session logout event (CancelOnLogout).

```yaml theme={null}
fixConf: |-
  [DEFAULT]
  ConnectionType=acceptor
  SocketAcceptPort=13001
  BeginString=FIXT.1.1
  DefaultApplVerID=9
  SenderCompID=EP3
  StartDay=Sunday
  StartTime=16:45:01
  EndDay=Sunday
  EndTime=16:45:00
  TimeZone=America/Chicago
  [SESSION]
  ClearingMemberFirm=firms/Clearing-Member-1
  Firm=firms/Trading-Firm-A
  TargetCompID=TFA
  CancelOnDisconnect=Y
  ResetOnLogon=Y
  [SESSION]
  ClearingMemberFirm=firms/Clearing-Member-1
  Firm=firms/Trading-Firm-B
  TargetCompID=TFB
  CancelOnDisconnect=N
  CancelOnLogout=Y
  ResetOnLogon=Y
```

## Sequence Number Tracking, Recovery, and Reset

The FIX protocol uses simple, incrementing MsgSeqNum (34) values (carried in the StandardHeader of each message) to both detect and request retransmission of missed messages.

Each FIX engine will maintain a simple message count of outbound and inbound messages, values which should increment by one for each message sent or received per FIX session. Should a message be received that does not match the expected sequence number given, then it is possible that one or more messages were lost.

In that situation, a ResendRequest \[2] message may be sent to request retransmission of a specified range of messages identified by their MsgSeqNum (34) value.

### Table 7: ResendRequest (2) message

<table>
  <thead>
    <tr>
      <th width="80">Tag</th>
      <th width="200">Name</th>
      <th width="50">Req</th>
      <th width="100">Type</th>
      <th>Description</th>
    </tr>
  </thead>

  <tbody>
    <tr><td>\< Standard Header ></td><td /><td>Y</td><td /><td>35 = 2</td></tr>
    <tr><td>7</td><td>BeginSeqNo</td><td>Y</td><td>SeqNum</td><td>MsgSeqNum (34) of first message in the range to be resent (inclusive)</td></tr>
    <tr><td>16</td><td>EndSeqNo</td><td>Y</td><td>SeqNum</td><td>MsgSeqNum (34) of the last message in the range to be resent (inclusive), or "0" to request resend all messages after the indicated BeginSeqNo (7)</td></tr>
    <tr><td>\< Standard Trailer ></td><td /><td>Y</td><td /><td /></tr>
  </tbody>
</table>

The expected response to a ResendRequest \[2] message is a stream of application messages with PossDupFlag (43) set to “Y” (yes) in the header to indicate that this is a potentially duplicative message.

It may be appropriate in some situations for the opposite FIX engine to refuse to replay the message. This is typically the case for administrative messages which either have limited value (e.g., Heartbeat messages) or might cause confusion (e.g., Logon messages). In such circumstances, the opposite FIX engine may respond with a SequenceReset \[4] message (below) with GapFillFlag (123) set to “Y”.

The SequenceReset \[4] message can be used in two distinct situations:\
To request that the counterparty adjusts their internal sequence number to the indicated NewSeqNo (36) value. In this case, GapFillFlag (123) is either not present or set to “N” (no).
In the message replay situation described above, to replace a FIX message which will not be re-sent. In this case, GapFillFlag (123) should be set to “Y” and the NewSeqNo (36) field will contain the next sequence number to be sent.

### Table 8: SequenceReset (4) message

<table>
  <thead>
    <tr>
      <th width="80">Tag</th>
      <th width="200">Name</th>
      <th width="50">Req</th>
      <th width="100">Type</th>
      <th>Description</th>
    </tr>
  </thead>

  <tbody>
    <tr><td>\< Standard Header ></td><td /><td>Y</td><td /><td>35 = 4</td></tr>
    <tr><td>123</td><td>GapFillFlag</td><td>N</td><td>Boolean</td><td>Indicates that the Sequence Reset message is replacing administrative or application messages which will not be resent.</td></tr>
    <tr><td>36</td><td>NewSeqNo</td><td>Y</td><td>SeqNum</td><td>New sequence number</td></tr>
    <tr><td>\< Standard Trailer ></td><td /><td>Y</td><td /><td /></tr>
  </tbody>
</table>

### Figure 3: ResendRequest \[2] message triggers re-transmission of missed messages

![](https://files.readme.io/1e36f8b-resend_request.png)

## Terminating a FIX Session

The Logout \[5] message initiates or confirms the termination of a FIX session. Customers may log out of their FIX sessions at any time.

### Table 9: Logout (5) message

<table>
  <thead>
    <tr>
      <th width="80">Tag</th>
      <th width="200">Name</th>
      <th width="50">Req</th>
      <th width="100">Type</th>
      <th>Description</th>
    </tr>
  </thead>

  <tbody>
    <tr><td>\< Standard Header ></td><td /><td>Y</td><td /><td>35 = 5</td></tr>
    <tr><td>58</td><td>Text</td><td>N</td><td>String</td><td>Free format text string</td></tr>
    <tr><td>\< Standard Trailer ></td><td /><td>Y</td><td /><td /></tr>
  </tbody>
</table>

The expected response to a successful Logout \[5] message is a reciprocal Logout \[5] message, after which the TCP connection should be dropped.

**Example 2: Logout message**

```
8=FIXT.1.1 | 9=51 | 35=5 | 34=2 | 49=SENDER | 52=20240516-14:17:38 | 56=TARGET | 10=237 |
```

### Figure 4: Graceful Logout sequence

![](https://files.readme.io/d4287de-logout.png)

Participants are recommended to schedule a graceful logout before the start of a scheduled maintenance window. If this is not received, then the Polymarket US will initiate the logout process.

**IMPORTANT: If Cancel on Disconnect is enabled, any open (unexecuted) DAY orders in the Polymarket US are automatically canceled when a FIX session terminates for any reason, including a graceful logout. GTC and GTD orders will continue to rest.**

## General Error Handling

Most transactional messages in FIX are rejected using an application-level message (as described in various sections which follow).

In the event that one of these messages can not be used to reject a message, however, then the Polymarket US may return either a Reject \[3] message, or a BusinessMessageReject \[j] message as described below.\
Reject \[3] messages are commonly used to reject messages where the message type is known, but there is something syntactically wrong with its content (e.g. incorrect repeating group).
BusinessMessageReject \[j] is a more generic message used to reject errors such as unsupported message type or malformed messages.

### Table 10: Reject (3) message

<table>
  <thead>
    <tr>
      <th width="80">Tag</th>
      <th width="200">Name</th>
      <th width="50">Req</th>
      <th width="100">Type</th>
      <th>Description</th>
    </tr>
  </thead>

  <tbody>
    <tr><td>\< Standard Header ></td><td /><td>Y</td><td /><td>35 = 3</td></tr>
    <tr><td>45</td><td>RefSeqNum</td><td>Y</td><td>SeqNum</td><td>The message sequence number being rejected</td></tr>
    <tr><td>371</td><td>RefTagID</td><td>N</td><td>int</td><td>The tag (field) number being rejected</td></tr>
    <tr><td>373</td><td>SessionRejectReason</td><td>N</td><td>int</td><td>Reason for the rejection. 0=Invalid tag number, 1=Required tag missing, 2=Tag not defined for this message type, 3=Undefined tag, 4=Tag specified without value, 5=Value is incorrect, 6=Incorrect data format for value, 9=CompID problem, 10=SendingTime accuracy problem, 11=Invalid MsgType, 13=Tag appears more than once, 14=Tag specified out of required order, 15=Repeating group fields out of order, 16=Incorrect NumInGroup count, 99=Other</td></tr>
    <tr><td>58</td><td>Text</td><td>N</td><td>String</td><td>Optional string to further describe the error</td></tr>
    <tr><td>\< Standard Trailer ></td><td /><td>Y</td><td /><td /></tr>
  </tbody>
</table>

<br />

**Example 3: Reject \[3] example due to bad limit price**

```
8=FIXT.1.1 | 9=127 | 35=3 | 34=39 | 49=TARGET | 52=20240517-19:08:47 | 56=SENDER | 45=42 | 58=Value is incorrect (out of range) for this tag | 371=44 | 372=D | 373=5 | 10=237 |
```

<br />

### Table 11: BusinessMessageReject (j) message

<table>
  <thead>
    <tr>
      <th width="80">Tag</th>
      <th width="200">Name</th>
      <th width="50">Req</th>
      <th width="100">Type</th>
      <th>Description</th>
    </tr>
  </thead>

  <tbody>
    <tr><td>\< Standard Header ></td><td /><td>Y</td><td /><td>35 = j</td></tr>
    <tr><td>45</td><td>RefSeqNum</td><td>N</td><td>SeqNum</td><td>The message sequence number being rejected</td></tr>
    <tr><td>58</td><td>Text</td><td>N</td><td>String</td><td>String to further describe the error</td></tr>
    <tr><td>372</td><td>RefMsgType</td><td>Y</td><td>String</td><td>The MsgType being rejected</td></tr>
    <tr><td>379</td><td>BusinessRejectRefID</td><td>N</td><td>String</td><td>When a FIX gateway rejects a message with a BusinessMessageReject, it provides tag 379 (BusinessRejectRefID) on the BusinessMessageReject and populates it with the ClOrdId or MDReqID to allow FIX clients to quickly determine which message was rejected.</td></tr>
    <tr><td>380</td><td>BusinessRejectReason</td><td>Y</td><td>int</td><td>The reason for the rejection. 0=Other, 1=Unknown ID, 2=Unknown Security, 3=Unsupported Message Type, 4=Application Not Available (downtime), 5=Conditionally required field missing, 6=Not authorized, 18=Invalid price increment (tick size)</td></tr>
    <tr><td>\< Standard Trailer ></td><td /><td>Y</td><td /><td /></tr>
  </tbody>
</table>

<br />

**Example 4: BusinessMessageReject \[j] example due to bad role permissions**

```
8=FIXT.1.1 | 9=116 | 35=j | 34=5 | 49=TARGET | 52=20240516-14:19:40 | 56=SENDER | 45=6 | 58=Supervising firms cannot perform this action | 372=x | 380=6 | 10=082 |
```
