require 'pry'
require 'json'
require 'csv'

current_json = JSON.parse(File.read('./public/irt_routes_stops_with_l_and_gs.json'))

routes = current_json['routes']
stops  = current_json['stops']

newCSV = CSV.open("./public/mta_resources/changed_stops.csv", 'w',
                  :write_headers => true,
                  :headers => ['stop_id', 'new_name'] ) do |csv|

  stops.each do |stop|
    stop_data = [stop['stop_id'], stop['stop_name']]
    csv << stop_data
  end

end
