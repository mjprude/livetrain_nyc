require 'csv'
Dir["./models/*.rb"].each {|file| require file }

CSV.foreach('stations.csv') do |row|
  options = {}
  options[:mta_id] = row[0]
  options[:name] = row[1]
  options[:lat] = row[2]
  options[:lng] = row[3]
  Station.create(options)
end