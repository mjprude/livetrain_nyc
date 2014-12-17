require 'bundler'
Bundler.require
require './connection'

configure do
  enable :cross_origin
end

ROOT_PATH = Dir.pwd
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
  # MTA::FeedParser.feed
  update_json
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