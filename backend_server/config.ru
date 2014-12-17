require './app.rb'
require 'pry'
Rack::Handler::Thin.run Sinatra::Application
