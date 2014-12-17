module DBHelper

def update_json
  all_trains = []

  route_obj = {}

  Trip.where(route: '1').each do |trip|

    future_stops = trip.stops.where('arrival_time > ?',  Time.now.to_i).order('arrival_time ASC').first
    last_stop = trip.stops.where('departure_time < ?',  Time.now.to_i).order('departure_time DESC').first
    last_stop ||= trip.stops.where('departure_time > ?',  Time.now.to_i).order('departure_time ASC').first
    stop1 = future_stops || last_stop

    begin
      if stop1 && last_stop

        route_obj[trip.mta_trip_id] = {
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
  all_trains.to_json
end

end
helpers DBHelper
