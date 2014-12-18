module DBHelper

def update_json
  all_trains = []

  Trip.where(route: '1').each do |trip|
    if trip.start_time - Time.now.to_i < 60
      future_stop = trip.stops.where('arrival_time > ?',  Time.now.to_i).order('arrival_time ASC').first
      last_stop = trip.stops.where('departure_time < ?',  Time.now.to_i).order('departure_time DESC').first
      last_stop ||= trip.stops.where('departure_time > ?',  Time.now.to_i).order('departure_time ASC').first
      stop1 = future_stop

      begin
        if stop1 && last_stop
          route_obj = {
            trip_id: 't' + trip.mta_trip_id.gsub('.', '_'),
            route: trip.route,
            direction: trip.direction,
            updated: trip.mta_timestamp,

            lastStop: last_stop.stop_id,
            lastDeparture: last_stop.departure_time,

            stop1: stop1.stop_id,
            path1: Shapes.get_path(trip.route, last_stop.stop_id, stop1.stop_id),
            arrival1: stop1.arrival_time,
            departure1: stop1.departure_time,
          }
        end
      rescue Exception => e
        e
        binding.pry
      end
      all_trains << route_obj
    end
  end
  all_trains.to_json
end

end
helpers DBHelper
