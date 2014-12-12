require './mta_assets/gtfs-realtime.pb.rb'
require './mta_assets/nyct-subway.pb.rb'
require 'httparty'
require 'json'
require 'pry'

##########################################################
# Use this file to retrieve MTA feed data every 35 seconds
# Turn off the program using ctrl+c
##########################################################

@feedA = true

loop do
  current_time = Time.now
  date, time, zone = current_time.to_s.split(' ')
  string = "./mta_assets/feeds/#{@feedA ? 'feedA' : 'feedB'}/" + date + "_" + time.gsub(':', '.') + "_" + 'realtime.json'

  transit_realtime_data = TransitRealtime::FeedMessage.parse(HTTParty.get("http://datamine.mta.info/mta_esi.php?key=#{ENV['MTA_REALTIME_API_KEY']}&feed_id=1")).to_hash
  ###
  ### Maybe come up with a way to handle situations where transit_realtime_data is not available?
  ###
  Dir.glob("./mta_assets/feeds/#{@feedA ? 'feedA' : 'feedB'}/*.json") do |file|
    File.delete(file)
  end
  f = File.open(string, "a+")
  f.write(JSON.generate(transit_realtime_data))
  f.close
  @feedA = !@feedA
  sleep 30
end