require './gtfs-realtime.pb.rb'
require './nyct-subway.pb.rb'
require 'pry'
require 'json'

serialized_string = File.read('./historic_gtfs/gtfs-2014-09-17-00-01')

transit_realtime = TransitRealtime::FeedMessage.parse(serialized_string)
transit_realtime = transit_realtime.to_hash

f = File.open("historic_data_sample.json", "a+")
f.write(transit_realtime.to_json)
f.close


# binding.pry

