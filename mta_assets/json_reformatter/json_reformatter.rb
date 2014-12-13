require 'json'
require 'pry'

@return_hash = {}

@routes = JSON.parse(File.read("./subway_routes_geojson.json"))

@stops = JSON.parse(File.read("./subway_stops_geojson.json"))

def route_filter(array_of_route_ids)
  @return_hash['routes'] = @routes['features'].select {|route| array_of_route_ids.include?(route['properties']['route_id'])}
end

def stop_filter(array_of_route_ids)
  @return_hash['stops'] = @stops['features'].select do |route|
    route['properties']['Routes_ALL'].split(', ').any? {|line| array_of_route_ids.include?(line)}
  end
end

def write_file(hash, filename)
  f = File.open(filename, "a+")
  f.write(JSON.generate(hash))
  f.close
end

route_ids = ['1', '2', '6', 'GS']
route_filter(route_ids)
stop_filter(route_ids)


binding.pry