---
# Live Train
---
<i>Visualizing the NYC subway system in real time</i><br>
http://www.livetrain.nyc


## About
The primary goal of this project is to, with as much accuracy as possible, map out the current location of every train in the New York City subway system. Because, at present, the MTA only provides real-time arrival data for the IRT (<i>1, 2, 3, 4, 5,</i> and <i>6</i> trains) and <i>L</i> trains, those are the only trains shown on the map. This visualization is aimed at both commuters, who may find this information useful to their commutes, and at the general public, who we hope will appreciate the activity and complexity of the largest rapid-trasit system in the world (by number of stations) and busiest in the Western hemisphere.

This project was conceived, developed, and maintained by Michael Prude and Ted Mahoney as their final project for the Web Development Intensive Course at General Assembly, a 12-week program in full-stack development.

## Technologies Used
- Ruby
- Sinatra
- D3
- Leaflet/Mapbox
- Google Protocol Buffers

## Using MTA real-time arrival data
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
`curl http://datamine.mta.info/mta_esi.php?key=<developerkey> -o /tmp/mtafeed`

### -Decode the data using protobuffers 
##### Protoc is from the compiled Google Protocol Buffers & gtfs-realtime.proto is the proto definition (configuration specific to the MTA's use of of protobuffers)

`$ cat /tmp/mtafeed | /usr/local/bin/protoc -I /tmp /tmp/gtfs-realtime.proto  --decode=transit_realtime.FeedMessage > /tmp/decodedmtafeed
`
### -Parsing Protocol Buffers using Ruby

This process relies on a gem called ruby-protocol-buffers:
https://github.com/codekitchen/ruby-protocol-buffers

```bash
gem install ruby-protocol-buffers
```

The gem allows us to specify a .proto file that we'd like to convert to comprehensible(ish) ruby code and writes a .pb.rb file.  That file contains ruby modules that can then be used to parse serialized Protocol Buffer feeds.

Download the necessary .proto files.  In this case we need: 
- Google's standard gtfs-realtime.proto
- The MTA specific nyct-subway.proto

##### Run the following commands

```bash
ruby-protoc gtfs-realtime.proto
ruby-protoc gtfs-nyct-subway.proto
```

Now that we have the ability to do something with the Protocol Buffer feed, we need to grab the MTA's feed. (See API curl above. In the case below we saved the feed to our working directory)

In a separate ruby file, require the gtfs-realtime.pb.rb and gtfs-realtime.proto files. Here's where the magic of the ruby-protocol-buffers gem comes into play.  We can use the modules that it wrote for us and the .parse method to read the encrypted string. It turns out you can call .to_hash on the return value of .parse and you get a nice, familiar ruby hash.

```ruby
require './gtfs-realtime.pb.rb'
require './nyct-subway.pb.rb'

serialized_string = File.read('./mtafeed')

transit_realtime = TransitRealtime::FeedMessage.parse(serialized_string)
transit_realtime = transit_realtime.to_hash
```

NOTE: The ruby-protocol-buffers github readme says to use the varint gem for improved performance.
