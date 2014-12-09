require 'json'
require 'pry'

def stops
  stops = File.read('stations.json')
  stops = JSON.parse(stops)
end

# def stops
#   stops = File.read('subway_stops_geojson.json')
#   stops = JSON.parse(stops)
# end



def route
  route = File.read('mta_server/subway_routes_geojson.json')
  data = JSON.parse(route)
end

def get_stations_by_line(line)
  stops.map { |stop| stop['stops'].keys[0][0] == line.to_s ? stop['stops'].values : nil }.compact
end

def get_shape_by_line(line)
  route['features'].map do |feature|
    if feature['properties']['route_id'] == line.to_s
      feature['geometry']['coordinates']
    end
  end.compact
end

stop = [ -73.918822, 40.864621 ]

shape = get_shape_by_line('1').flatten(2)

def distance_between(point1, point2)
  (point1[1] - point2[1]).abs + (point1[0] - point2[0]).abs
end

def insert_stop_into_shape(shape, stop)
  # line = line.to_s
  # stations = get_stations_by_line(line).flatten(1)
  shape.include?(stop) && return 'already got it'
  closest_value = shape.min_by{ |point| distance_between(point, stop) }
  closest_index = shape.index(closest_value)

  stop_distance = distance_between(closest_value, stop)

  if closest_index != shape.length
    point_south = shape[closest_index + 1]

    point_distance = distance_between(closest_value, point_south)

    stop_distance > point_distance ? shape.insert(closest_index, stop) : shape.insert(closest_index + 1, stop)

  else
    point_distance = distance_between(closest_value, shape[closest_index -1])
    stop_distance > point_distance ? shape.insert(-1, stop) : shape.insert(closest_index, stop)
  end

    # direction = [(shape[closest_index + 1][0] <=> closest_value[0]]), (shape[closest_index + 1][1] <=> closest_value[1]])]
    # stop_direction = [(stop[0] <=> closest_value[0]), (stop[1] <=> closest_value[1])]

    # line_east? = (shape[closest_index + 1][0] - closest_value[0]) > 0
    # line_south? = (shape[closest_index + 1][1] - closest_value[1]) < 0
    # stop_east? = (stop[0] - closest_value[0]) > 0
    # stop_south? = (stop[1] - closest_value[1]) < 0


  # result = shape.select{ |point| (point[1] - stop[1]).abs < x }

  # if result.length < 2
  #   insert_stop_into_shape(shape, stop, x+0.001)
  # elsif result.length > 2
  #   insert_stop_into_shape(shape, stop, x-0.001)
  # else
  #   binding.pry
  #   return result
  # end

  # stations.map do |station|
  #   shape.assoc(station[1]) || shape.rassoc(station[0])
  # end

  # shape.map do |point|
  #   stations.select { |stop| stop[0] == point[1] || stop[1] == point[0] }
  # end
end




binding.pry