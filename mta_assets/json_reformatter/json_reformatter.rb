require 'json'
require 'pry'

@colors = {
  '1' => "(150, 24, 19)",
  '2' => "(150, 24, 19)",
  '3' => "(150, 24, 19)",
  '4' => "(0, 128, 53)",
  '5' => "(0, 128, 53)",
  '6' => "(0, 128, 53)",
  'GS' => "(128, 129, 131)",
  'L' => "(128, 129, 131)"

}

@return_hash = {}

@routes = JSON.parse(File.read("./subway_routes_geojson.json"))

@stops = JSON.parse(File.read("./subway_stops_geojson.json"))

def get_color(route_id)
  @colors[route_id]
end

def route_filter(array_of_route_ids)
  @return_hash['routes'] = @routes['features'].select {|route| array_of_route_ids.include?(route['properties']['route_id'])}
end

def stop_filter(array_of_route_ids)
  @return_hash['stops'] = @stops['features'].select do |route|
    route['properties']['Routes_ALL'].split(', ').any? {|line| array_of_route_ids.include?(line)}
  end
end

def reformat_routes
  @return_hash['routes'] = @return_hash['routes'].map do |route|
    {
      'route_id' => route['properties']['route_id'],
      'color' => get_color(route['properties']['route_id']),
      'path_coordinates' => route['geometry']['coordinates'],
      'line' => route['properties']['Line']
    }
  end
end

def reformat_stops
  @return_hash['stops'] = @return_hash['stops'].map do |stop|
    {
      'stop_id' => stop['properties']['STOP_ID'],
      'stop_name' => stop['properties']['NAME_CUR'].gsub('STREET', 'ST'),
      'routes' => stop['properties']['Routes_ALL'].split(', '),
      'colors' => stop['properties']['Routes_ALL'].gsub('X', '').split(', ').map {|route_id| get_color(route_id)}.uniq,
      'coordinates' => stop['geometry']['coordinates'],
    }
  end
end

def write_file(hash, filename)
  f = File.open(filename, "a+")
  f.write(JSON.generate(hash))
  f.close
end

route_ids = ['1', '2', '3', '4', '5', '6', 'L', 'GS']
route_filter(route_ids)
stop_filter(route_ids)
reformat_routes
reformat_stops

def add_reverse_shuttle
  shuttle_hash = @return_hash['routes'].select {|route| route['route_id'] == 'GS'}[0].clone
  shuttle_hash['path_coordinates'] = shuttle_hash['path_coordinates'].reverse
  shuttle_hash['route_id'] = 'GSN'
  @return_hash['routes'] << shuttle_hash
end

add_reverse_shuttle

write_file(@return_hash, './irt_routes_and_stops.json')

# def add_reverse_shuttle
#   shuttle_hash_array = @return_hash['routes'].select {|route| route['route_id'] == 'GS'}.map do |route|
#     shuttle_hash['path_coordinates'] = shuttle_hash['path_coordinates'].reverse
#     shuttle_hash['route_id'] = 'GSN'
#   end
#   @return_hash['routes'] << shuttle_hash_array[0]
# end