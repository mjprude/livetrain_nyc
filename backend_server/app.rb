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