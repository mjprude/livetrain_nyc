require './gtfs-realtime.pb.rb'
require './nyct-subway.pb.rb'
require 'httparty'
require 'json'
require 'pry'

##########################################################
# Use this file to retrieve MTA feed data every 35 seconds
# Turn off the program using ctrl+c
##########################################################

loop do
  current_time = Time.now
  date, time, zone = current_time.to_s.split(' ')
  string = "./parsed_feeds/irt_files/" + date + "_" + time.gsub(':', '.') + "_" + 'realtime.json'

  transit_realtime_data = TransitRealtime::FeedMessage.parse(HTTParty.get("http://datamine.mta.info/mta_esi.php?key=#{ENV['MTA_REALTIME_API_KEY']}&feed_id=1")).to_hash

  f = File.open(string, "a+")
  f.write(JSON.generate(transit_realtime_data))
  f.close
  sleep 35
end