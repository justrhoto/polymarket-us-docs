> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# FIX Components

## Standard Header & Trailer

Each FIX message sent to and received from the Polymarket US must start and end with a message header and trailer components.

## Standard Header Component

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
    <tr><td>8</td><td>BeginString</td><td>Y</td><td>String</td><td>FIXT.1.1</td></tr>
    <tr><td>9</td><td>BodyLength</td><td>Y</td><td>Length</td><td>Standard FIX message body length</td></tr>
    <tr><td>35</td><td>MsgType</td><td>Y</td><td>String</td><td>The message type. See relevant section.</td></tr>
    <tr><td>49</td><td>SenderCompID</td><td>Y</td><td>String</td><td>Sender identity as agreed with the exchange operator.</td></tr>
    <tr><td>56</td><td>TargetCompID</td><td>Y</td><td>String</td><td>Intended target identity as agreed with the exchange operator.</td></tr>
    <tr><td>50</td><td>SenderSubID</td><td>C</td><td>String</td><td>Sender sub-identifier representing an individual user (as previously agreed with the exchange operator). Required on all application messages related to the entry or management of orders.</td></tr>
    <tr><td>57</td><td>TargetSubID</td><td>N</td><td>String</td><td>Target sub-identifier representing an individual user (as previously agreed with the exchange operator)</td></tr>
    <tr><td>34</td><td>MsgSeqNum</td><td>Y</td><td>SeqNum</td><td>FIX Message sequence number</td></tr>
    <tr><td>43</td><td>PossDupFlag</td><td>N</td><td>Boolean</td><td>Always required for retransmitted messages as the result of a resend request</td></tr>
    <tr><td>52</td><td>SendingTime</td><td>Y</td><td>UTCTime</td><td>Sending time in UTC</td></tr>
  </tbody>
</table>

## Standard Trailer Component

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
    <tr><td>10</td><td>Checksum</td><td>Y</td><td>String</td><td>Standard FIX checksum</td></tr>
  </tbody>
</table>
