# Using MTA real-time arrival data
The MTA provides it's real-time subway arrival data in a google protocol buffer format. To use this, follow the instructions below:

Explination of installation:
https://news.ycombinator.com/item?id=4979517

### -Get a Developer API Key from the MTA
http://datamine.mta.info/user/register

### -Download Google Protocol Buffers
https://developers.google.com/protocol-buffers/docs/downloads

### -The proto definition of the GTFS-realtime feed:
 https://developers.google.com/transit/gtfs-realtime/gtfs-realtime-proto
`
$ cat /tmp/mtafeed | /tmp/protobuf-2.6.0/src/protoc -I /tmp /tmp/gtfs-realtime.proto  --decode=transit_realtime.FeedMessage > /tmp/decodedmtafeed`
