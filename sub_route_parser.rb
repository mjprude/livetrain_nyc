require 'JSON'
require 'pry'

def stops
  stops = File.read('subway_stops_geojson.json')
  JSON.parse(stops)['features']
end

# def stops
#   stops = File.read('subway_stops_geojson.json')
#   stops = JSON.parse(stops)
# end



def route
  route = File.read('backend_server/subway_routes_geojson.json')
  data = JSON.parse(route)
end

def get_stops_by_line(line)
  stops.map do |stop|
    stop_hash = Hash.new
    if stop['properties']['Routes_ALL'] && stop['properties']['Routes_ALL'].include?(line.to_s.upcase)
      stop_id = stop['properties']['STOP_ID']
      stop_hash[stop_id] = stop['geometry']['coordinates']
    end
    stop_hash == {} ? nil : stop_hash
  end.compact
end

{
    '101S' => [[-74, 46], [-74.2, 47]],
    '103S' => [[-74, 46], [-74.2, 47]],
}

# def get_stops_by_line(line, direction='S')
#   all_stops = stops.map do |stop|
#     if stop['stops'].length > 1
#       stop_in_line = stop['stops'].select{ |k, v| k[0] == line.to_s }
#       if stop_in_line != {}
#         Hash stop_in_line.keys[0] + direction => stop_in_line.values[0].reverse!
#       end
#     elsif stop['stops'].keys[0][0] == line.to_s
#       stop['stops'].values[0].reverse!
#       stop['stops']
#       Hash stop['stops'].keys[0] + direction => stop['stops'][stop['stops'].keys[0]]
#     end
#   end.compact

  # ordered_stops = all_stops.sort_by { |stop| stop.keys[0][1..2].to_i }

  # direction.downcase == 's' ? ordered_stops : ordered_stops.reverse!
# end

def get_shape_by_line(line, direction='S')
  # shape =
  route['features'].map do |feature|
    if feature['properties']['route_id'] == line.to_s
      feature['geometry']['coordinates']
    end
  end.compact.flatten(1)

  # direction.downcase == 's' ? shape.reverse! : shape
end
# stop = [-73.899, 40.889248000933826]
# # stop = [ -73.918822, 40.864621 ]

shape = get_shape_by_line('1')

def distance_between(point1, point2)
  begin
    (point1[1] - point2[1]).abs + (point1[0] - point2[0]).abs
  rescue
    puts "Error at #{point1}"
    puts "Error at #{point2}"
  end
end

def insert_stops_into_line(line, direction='S')
  shape = get_shape_by_line(line, direction)
  stops = get_stops_by_line(line)

  stops.each do |stop|
    stop_name, stop_point = stop.first

    if !shape.include?(stop_point)
      closest_value = shape.min_by{ |point| distance_between(point, stop_point) }
      closest_index = shape.index(closest_value)

      if closest_index != shape.length - 1 && closest_index != 0
        point_north = shape[closest_index + 1]
        stop_distance = distance_between(stop_point, point_north)

        point_distance = distance_between(closest_value, point_north)
        if stop_distance > point_distance
          shape.insert(closest_index, stop_point)
        else
          shape.insert(closest_index + 1, stop_point)
        end

      elsif closest_index == (shape.length - 1)
        shape[-1] = stop_point
        # point_south = shape[-2]
        # stop_distance = distance_between(stop_point, point_south)
        # point_distance = distance_between(closest_value, point_south)

        # stop_distance > point_distance ? shape.insert(-1, stop_point) : shape[-1] = stop_point
      elsif closest_index == 0
        shape[0] = stop_point
      end
    end
  end
  # ignore Neried branch of 5 train...
  line.to_s == '5' && shape.pop
  shape
end

# shapes go south to north
def subdivide_line_by_stop(line, direction='S')
  shape = insert_stops_into_line(line)
  stops = get_stops_by_line(line)
  stop_points = stops.map{|stop| stop.values[0]}

  stop_indecies = []

  stop_points.each do |stop|
    shape.each_index{|i| shape[i] == stop ? stop_indecies << i : nil}
  end

  stop_indecies.sort!

  binding.pry

  shape[stop_indecies[0]] == shape[stop_indecies[1]] && shape.shift
  shape[stop_indecies[-1]] == shape[stop_indecies[-2]] && shape.pop

  stops_array = (stop_indecies.length / 2).times.with_object([]) do |i, obj|
    if direction == 'N'
      next_stop = get_stop_by_point(stops, shape[stop_indecies[1]], 'N')
      segment = shape[stop_indecies[0]..stop_indecies[1]]
      begin
        next_stop[next_stop.keys[0]] = segment
        next_stop = get_stop_by_point(stops, shape[stop_indecies[-2]], 'S')
        segment = shape[stop_indecies[-2]..stop_indecies[-1]].reverse!
        next_stop[next_stop.keys[0]] = segment
      rescue
        puts next_stop
        puts shape[stop_indecies[1]]
      end
      stop_indecies.shift(2)
      obj << next_stop
    else
      stop_indecies.pop(2)
      obj << next_stop
    end
    obj
  end
  binding.pry
end

def get_stop_by_point(stops, coordinates, direction='S')
  stops.find{|stop| stop.values[0] == coordinates && stop.keys[0][-1] == direction}
end

def subdivide_shape_by_stop(shape, stop)
  stop_name, stop_point = stop.first

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

def return_line_object(line, direction='S', stop_name=nil)
  stop_name = stop_name || line
  shape = get_shape_by_line(line, direction)
  all_stops = get_stops_by_line(stop_name, direction)
  all_stops.each{ |stop| subdivide_shape_by_stop(shape, stop)}
end

def sub_path(line, origin, destination)
  stops = get_stops_by_line(line)
  shape = insert_stops_into_line(line)
  orig_point = stops.select{|stop| stop.keys[0] == origin.to_s }[0].values[0]
  dest_point = stops.select{|stop| stop.keys[0] == destination.to_s }[0].values[0]
  orig_index = shape.index(orig_point)
  dest_index = shape.index(dest_point)

  if orig_index > dest_index
    return shape[dest_index..orig_index].reverse
  else
    return shape[orig_index..dest_index]
  end
end

# 5 train branches, requires special handling...
live_lines = [1, 2, 3, 4, 5, 6, 'L']

# f = File.open('shapes_by_stop.json', 'w+')
#   json_stops = []
#   live_lines.each{ |line| json_stops << return_line_object(line, 'S') }
#   live_lines.each{ |line| json_stops << return_line_object(line, 'N') }
#   json_stops << return_line_object('GS', 'S', 9)
#   json_stops << return_line_object('GS', 'N', 9)
#   f.write json_stops.flatten.to_json
# f.close

binding.pry