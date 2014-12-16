module RoutePath
  require 'JSON'

  def stops
    stops = File.read('mta_assets/subway_stops_geojson.json')
    JSON.parse(stops)['features']
  end

  def route
    route = File.read('mta_assets/subway_routes_geojson.json')
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

  def get_shape_by_line(line)
    route['features'].map do |feature|
      if feature['properties']['route_id'] == line.to_s
        feature['geometry']['coordinates']
      end
    end.compact.flatten(1)
  end

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

        elsif closest_index == 0
          shape[0] = stop_point
        end
      end
    end
    shape
  end

  def get_stop_by_point(stops, coordinates, direction='S')
    stops.find{|stop| stop.values[0] == coordinates && stop.keys[0][-1] == direction}
  end

  def sub_path(line, origin, destination, all_lines=['1','2','3','4','5','6','L'])
    stops = get_stops_by_line(line)
    shape = insert_stops_into_line(line)
    orig_point = stops.select{|stop| stop.keys[0] == origin.to_s }
    dest_point = stops.select{|stop| stop.keys[0] == destination.to_s }

    begin
      orig_index = shape.index(orig_point[0].values[0])
      dest_index = shape.index(dest_point[0].values[0])
      if orig_index > dest_index
        return shape[dest_index..orig_index].reverse
      else
        return shape[orig_index..dest_index]
      end

    rescue
      all_lines.delete(line.to_s)
      line != 'L' && sub_path(all_lines[0], origin, destination, all_lines)
    end
  end


# live_lines = [1, 2, 3, 4, 5, 6, 'L']

# f = File.open('lines_with_stops_inserted.rb', 'w+')
# live_lines.each do |line|
#   f.write("#{line}:   #{insert_stops_into_line(line)}\n\n\n\n")
# end
# f.close

end