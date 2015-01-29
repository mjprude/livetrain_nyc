require 'pry'
require 'json'
require 'csv'

current_json = JSON.parse(File.read('./public/irt_routes_stops_with_l_and_gs.json'))
updated_data = {}

current_routes = current_json['routes']
current_stops  = current_json['stops']

changed_names = CSV.read("./public/mta_resources/changed_stop_names.csv", :headers=> true)

new_stops = current_stops.map do |stop|
  matching_stop_data = changed_names.find {|changed_name| changed_name['stop_id'] == stop['stop_id']}
  stop['stop_name'] = matching_stop_data['changed_name']
  stop
end

updated_data['routes'] = current_routes
updated_data['stops'] = new_stops

new_json_file = File.open('./public/new_irt_routes_stops_with_l_and_gs.json', 'w')
new_json_file.write(updated_data.to_json)
new_json_file.close

binding.pry




### Use to write changed stop names csv from existing json
# newCSV = CSV.open("./public/mta_resources/changed_stop_names.csv", 'w',
#                   :write_headers => true,
#                   :headers => ['stop_id', 'changed_name'] ) do |csv|
#   stops.each do |stop|
#     stop_data = [stop['stop_id'], stop['stop_name']]
#     csv << stop_data
#   end
# end
###

### Use to combine original and changed stops csvs into a master file
# original_names = CSV.read("./public/mta_resources/original_stop_names.csv", :headers=> true)
# changed_names = CSV.read("./public/mta_resources/changed_stop_names.csv", :headers=> true)
# reconciled = CSV.open("./public/mta_resources/original_stops_with_changes.csv", 'w',
#                       :write_headers => true,
#                       :headers => ['stop_id', 'original_name', 'changed_name'] ) do |csv|
#   original_names.each do |original_stop|
#     matching_changed_data = changed_names.find {|changed_names| changed_names['stop_id'] == original_stop['stop_id']}
#     combined_data = [original_stop['stop_id'], original_stop['original_name'], matching_changed_data['changed_name']]
#     csv << combined_data
#   end
# end
###