require './gtfs-realtime.pb.rb'
require './nyct-subway.pb.rb'
require 'pry'

serialized_string = File.read('./mtafeed')

transit_realtime = TransitRealtime::FeedMessage.parse(serialized_string)
transit_realtime = transit_realtime.to_hash

binding.pry

