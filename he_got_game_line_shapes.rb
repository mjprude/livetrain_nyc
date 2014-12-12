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

def get_stops_by_line(line)
  all_stops = stops.map do |stop|
    if stop['stops'].keys[0][0] == line.to_s
      if stop['stops'].length > 1
        stop_in_line = stop['stops'].select{|k, v| k[0] == line.to_s}
        stop_in_line.values[0].reverse!
        stop_in_line
      else
        stop['stops'].values[0].reverse!
        stop['stops']
      end
    end
  end.compact
  all_stops.sort_by { |stop| stop.keys[0][1..2].to_i }
end

def get_shape_by_line(line)
  route['features'].map do |feature|
    if feature['properties']['route_id'] == line.to_s
      feature['geometry']['coordinates']
    end
  end.compact.flatten(2).reverse
end
# stop = [-73.899, 40.889248000933826]
# # stop = [ -73.918822, 40.864621 ]

shape = get_shape_by_line('1')

def distance_between(point1, point2)
  begin
    (point1[1] - point2[1]).abs + (point1[0] - point2[0]).abs
  rescue
    puts point1
    puts point2
  end
end

def subdivide_shape_by_stop(shape, stop)
  stop_name, stop_point = stop.first
  # line = line.to_s
  # stations = get_stations_by_line(line).flatten(1)
  if shape.include?(stop_point)
    stop_index = shape.index(stop_point)
    shape.insert(stop_index, stop_point)
    stop[stop_name] = shape.shift(stop_index+1)
  else

    closest_value = shape.min_by{ |point| distance_between(point, stop_point) }
    closest_index = shape.index(closest_value)

    if closest_index != shape.length - 1 && closest_index != 0
      point_north = shape[closest_index + 1]
      stop_distance = distance_between(stop_point, point_north)

      point_distance = distance_between(closest_value, point_north)
      if stop_distance > point_distance
        shape.insert(closest_index, stop_point, stop_point)
        stop[stop_name] = shape.shift(closest_index + 1)
      else
        shape.insert(closest_index + 1, stop_point, stop_point)
        stop[stop_name] = shape.shift(closest_index + 2)
      end

    elsif closest_index
      point_south = shape[closest_index - 1]
      stop_distance = distance_between(stop_point, point_south)
      point_distance = distance_between(closest_value, point_south)
# add to end or replace endpoint
      stop_distance > point_distance ? shape.insert(-1, stop_point) : shape[-1] = stop_point

      stop[stop_name] = shape
    end
  end
end

shape = get_shape_by_line(1)
all_stops = get_stops_by_line(1)

all_stops.each{ |stop| subdivide_shape_by_stop(shape, stop)}

f = File.open('one_stops_south.txt', 'w+')
f.write '['
all_stops.each{ |stop|
    f.write stop
  f << ",\n"
}
f.write ']'
f.close

binding.pry