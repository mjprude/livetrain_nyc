require 'bundler'
Bundler.require
require './connection'
ROOT_PATH = Dir.pwd
Dir[ROOT_PATH+"/lib/*.rb"].each{ |file| require file }
Dir[ROOT_PATH+"/helpers/*.rb"].each{ |file| require file }
Dir[ROOT_PATH+"/modules/*.rb"].each{ |file| require file }


get '/api/update' do
  content_type :json
  MTA::FeedParser.feed
end