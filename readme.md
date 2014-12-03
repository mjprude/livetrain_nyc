# Using MTA real-time arrival data
The MTA provides it's real-time subway arrival data in a google protocol buffer format. To use this, follow the instructions below:

Explaination of installation:
https://news.ycombinator.com/item?id=4979517

### -Get a Developer API Key from the MTA
http://datamine.mta.info/user/register

### -Download Google Protocol Buffers
https://developers.google.com/protocol-buffers/docs/downloads
- Follow the instructions in the readme to compile the source and locate the protoc file
- Note: it may be worth specifying an install location (see protocol-buffer readme)

### -The proto definition of the GTFS-realtime feed:
https://developers.google.com/transit/gtfs-realtime/gtfs-realtime-proto
 
### -Static data with IDs for each station, etc. (for parsing the data recieved)
https://github.com/jonthornton/MtaSanitizer/blob/master/stations.json

### -Curl the API into a file (with your developer key):
`curl http://datamine.mta.info/mta_esi.php?key=<developerkey> -o /tmp/mtafeed

### -Decode the data using protobuffers 
##### Protoc is from the compiled Google Protocol Buffers & gtfs-realtime.proto is the proto definition (configuration specific to the MTA's use of of protobuffers)

`$ cat /tmp/mtafeed | /tmp/protobuf-2.6.0/src/protoc -I /tmp /tmp/gtfs-realtime.proto  --decode=transit_realtime.FeedMessage > /tmp/decodedmtafeed
`

Let's break that down:

```bash
cat
```
Display the info to the terminal (just to get a sense of the world)
```bash
/tmp/mtafeed |
```
This is the file we created when we curled the API earlier. Pipe this into...
```bash
/tmp/protobuf-2.6.0/src/protoc -I 
```
The /tmp directory is presumably a terrible place to install our protocol buffer.  Will install this elsewhere.
```bash
/tmp /tmp/gtfs-realtime.proto  --decode=transit_realtime.FeedMessage > /tmp/decodedmtafeed
```
Not totally sure what all these things do. `/tmp` -not sure, followed by `/tmp/gtfs-realtime.proto` - the file containing MTA-specific definintions, `--decode=transit_realtime.FeedMessage >` - presumably this is where the actual decoding occurs, and `/tmp/decodedmtafeed` - the output file with the decoded data.
