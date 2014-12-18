module DBHelper

  def update_json
    all_trains = []

    Trip.where(route: '1').each do |trip|
      if trip.start_time - Time.now.to_i < 60

        last_stop = trip.stops.where('departure_time < ?',  Time.now.to_i).order('departure_time DESC').first
        last_stop ||= trip.stops.where('departure_time > ?',  Time.now.to_i).order('departure_time ASC').first

        stop1 = trip.stops.where('arrival_time > ?',  Time.now.to_i).order('arrival_time ASC').first

        stop2 = trip.stops.where('arrival_time > ?',  Time.now.to_i).order('arrival_time ASC').second
        trip2Complete = (stop2 == nil)

        stop3 = trip.stops.where('arrival_time > ?',  Time.now.to_i).order('arrival_time ASC').third
        trip3Complete = (stop3 == nil)



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

              trip1Complete: false,
              trip2Complete: trip2Complete,
              trip3Complete: trip3Complete
            }
          end

          if stop2
            route_obj[:stop2] = stop2.stop_id
            route_obj[:path2] = Shapes.get_path(trip.route, stop1.stop_id, stop2.stop_id)
            route_obj[:arrival2] = stop2.arrival_time
            route_obj[:departure2] = stop2.departure_time
          end

          if stop3
            route_obj[:stop3] = stop3.stop_id
            route_obj[:path3] = Shapes.get_path(trip.route, stop2.stop_id, stop3.stop_id)
            route_obj[:arrival3] = stop3.arrival_time
            route_obj[:departure3] = stop3.departure_time
          end

        rescue Exception => e
          e
          binding.pry
        end
        all_trains << route_obj
      end
    end
    all_trains.compact.to_json
  end

end
helpers DBHelper
