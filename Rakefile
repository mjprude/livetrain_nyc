require 'bundler'
Bundler.require

require 'sinatra/activerecord/rake'
require './connection'
ROOT_PATH = Dir.pwd
Dir[ROOT_PATH+"/lib/*.rb"].each{ |file| require file }
Dir[ROOT_PATH+"/helpers/*.rb"].each{ |file| require file }

namespace :db do

end

desc "Show Routes for This File"
task :routes do
  puts "******************"

  def capitalize_http(route)
    route
      .gsub('get', '    GET  ')
      .gsub('put', '    PUT  ')
      .gsub('patch', '  PATCH  ')
      .gsub('post', '   POST  ')
      .gsub('delete', ' DELETE  ')
  end

  def get_routes(path)
    route_regex = /(get|post|delete|patch|put) '\/.*(?= )/
    app = File.readlines(path)
    puts "Routes in #{path}\n******************"
    app.grep(route_regex).each do |line|
      puts capitalize_http(route_regex.match(line)[0])
    end
    puts "******************"
  end

  if File.exist?('app.rb')
    get_routes('app.rb')
  else
    Dir['./controllers/*.rb'].each{ |controller| get_routes(controller) }
  end

end