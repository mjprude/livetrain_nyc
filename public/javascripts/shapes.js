function getPath(line, origin, destination, all_lines=['1','2','3','4','5','6','L']) {
  var origin = origin.slice(0,3);
  var destination = destination.slice(0,3);
  var line = line.replace('X', '');


}

function getStopsByLine(line) {
  d3.json("/irt_routes_and_stops.json", function (json) {
    json.stops.map(function(stop) {
      
      debugger;
    });
  });
}

getStopsByLine(1)

/*

def self.get_path(line, origin, destination, all_lines=['1','2','3','4','5','6','L'])
    origin = origin.to_s[0..2]
    destination = destination.to_s[0..2]
    line = line.to_s.gsub('X', '')

    stops = get_stops_by_line(line)
    shape = get_shape_by_line(line)
    orig_point = stops.select{|stop| stop.keys[0] == origin }
    dest_point = stops.select{|stop| stop.keys[0] == destination }

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
      line != 'L' && get_path(all_lines[0], origin, destination, all_lines)
    end
  end

    def self.get_stops_by_line(line)
    stops.map do |stop|
      stop_hash = Hash.new
      if stop['properties']['Routes_ALL'] && stop['properties']['Routes_ALL'].include?(line.to_s.upcase)
        stop_id = stop['properties']['STOP_ID']
        stop_hash[stop_id] = stop['geometry']['coordinates']
      end
      stop_hash == {} ? nil : stop_hash
    end.compact
  end

*/