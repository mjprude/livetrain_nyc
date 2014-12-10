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

hash = JSON.parse(File.read("./edm_mapbox_sample/subway_routes_geojson.json"))

# def path_by_route_id(route_id)
#   hash['features'].select { |feature| feature['properties']['route_id'] == route_id }
#   binding.pry
# end

# path = path_by_route_id('GS')

binding.pry

