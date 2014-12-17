require 'bundler'
Bundler.require
require './connection'
ROOT_PATH = Dir.pwd
Dir[ROOT_PATH+"/lib/*.rb"].each{ |file| require file }
Dir[ROOT_PATH+"/helpers/*.rb"].each{ |file| require file }
Dir[ROOT_PATH+"/models/*.rb"].each{ |file| require file }
Dir[ROOT_PATH+"/modules/*.rb"].each{ |file| require file }

get '/' do
  redirect '/api/update'
end

get '/api/raw' do
  content_type :json
  MTA::FeedParser.raw_feed
end

get '/api/update' do
  content_type :json
  MTA::FeedParser.feed
end

get '/api/line/:route_id' do
  content_type :json
  MTA::FeedParser.line(params[:route_id])
end

get '/console' do
  binding.pry
end

get '/*' do
  redirect '/'
end

def jsonifier
  routes = Trip.uniq.pluck(:route)
  all_trains = routes.map do |route|

    route_obj = {}
    route_obj[:trainId] = route

    Trip.where(route: route).each do |trip|

      future_stops = trip.stops.where('arrival_time > ?',  Time.now.to_i).order('arrival_time ASC')
      last_stop = trip.stops.where('departure_time < ?',  Time.now.to_i).order('departure_time DESC').first
      last_stop ||= trip.stops.where('departure_time > ?',  Time.now.to_i).order('departure_time ASC').first
      stop1 = future_stops[0] || last_stop

      # stop2 = future_stops[1] || stop1
      # stop3 = future_stops[2] || stop2


      begin
      if stop1 && last_stop
        route_obj[trip.mta_trip_id] = {
          direction: trip.direction,
          updated: trip.mta_timestamp,

          lastStop: last_stop.stop_id,
          lastDeparture: last_stop.departure_time,

          stop1: stop1.stop_id,
          path1: Shapes.get_path(route, last_stop.stop_id, stop1.stop_id),
          arrival1: stop1.arrival_time,
          departure1: stop1.departure_time,

          # stop2: stop2.stop_id,
          # path2: Shapes.get_path(route, stop1.stop_id, stop2.stop_id),
          # arrival2: stop2.arrival_time,
          # departure2: stop2.departure_time,

          # stop3: stop3.stop_id,
          # path3: Shapes.get_path(route, stop2.stop_id, stop3.stop_id),
          # arrival3: stop3.arrival_time,
          # departure3: stop3.departure_time,
        }
      end
    rescue Exception => e
      e
      binding.pry
    end
    end
    route_obj
  end
  all_trains
  binding.pry
end
binding.pry

#   Trip.all.map do |trip|

#     stops = trip.stops.map do |stop|
#       {
#         stop_id: stop.stop_id,
#         arrival_time: stop.arrival_time,
#         departure_time: stop.departure_time,
#       }
#     end
#     {
#       trip_id: trip.mta_trip_id,
#       timetable: stops,
#     }
#   end

#   {
#   trainId: '1',
#   tripOne: {
#     path: 'path-22',
#     percentComplete: 0,
#     duration: 5000,
#     timeUntilDeparture: 3000,
#   },
#   tripTwo: {
#     path: 'path-24',
#     percentComplete: 0,
#     duration: 5000,
#     timeUntilDeparture: 0,
#   }
# }


# "091400_1..N" => {

# }

# about to leave the terminal: departure time in future, no last stop