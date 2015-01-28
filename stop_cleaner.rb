require 'pry'
require 'json'
require 'csv'

# current_json = JSON.parse(File.read('./public/irt_routes_stops_with_l_and_gs.json'))

# routes = current_json['routes']
# stops  = current_json['stops']

# newCSV = CSV.open("./public/mta_resources/changed_stop_names.csv", 'w',
#                   :write_headers => true,
#                   :headers => ['stop_id', 'changed_name'] ) do |csv|

#   stops.each do |stop|
#     stop_data = [stop['stop_id'], stop['stop_name']]
#     csv << stop_data
#   end

# end

original_names = CSV.read("./public/mta_resources/original_stop_names.csv", :headers=> true)
changed_names = CSV.read("./public/mta_resources/changed_stop_names.csv", :headers=> true)

reconciled = CSV.open("./public/mta_resources/original_stops_with_changes.csv", 'w',
                      :write_headers => true,
                      :headers => ['stop_id', 'original_name', 'changed_name'] ) do |csv|

  original_names.each do |original_stop|
    matching_changed_data = changed_names.find {|changed_names| changed_names['stop_id'] == original_stop['stop_id']}
    
    combined_data = [original_stop['stop_id'], original_stop['original_name'], matching_changed_data['changed_name']]

    csv << combined_data
  end

end