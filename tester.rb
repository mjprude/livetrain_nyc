require './mta_assets/gtfs-realtime.pb.rb'
require './mta_assets/nyct-subway.pb.rb'
require 'pry'
require 'json'

# serialized_string = File.read('./historic_gtfs/gtfs-2014-09-17-00-01')

# transit_realtime = TransitRealtime::FeedMessage.parse(serialized_string)
# transit_realtime = transit_realtime.to_hash

# f = File.open("historic_data_sample.json", "a+")
# f.write(transit_realtime.to_json)
# f.close

hash = JSON.parse(File.read("./client_server/public/subway_routes_geojson.json"))

stops = JSON.parse(File.read("./subway_stops_geojson.json"))

routes_all = stops['features'].map do |feature|
  {
    stop_id: feature['properties']['STOP_ID'],
    routes_all: feature['properties']['Routes_ALL'],
  }
end

nil_routes = routes_all.select do |route|
  route[:routes_all] == nil
end

string_routes = routes_all.select do |route|
  route[:routes_all] == ''
end

# def path_by_route_id(route_id)
#   hash['features'].select { |feature| feature['properties']['route_id'] == route_id }
#   binding.pry
# end

# path = path_by_route_id('GS')

binding.pry

