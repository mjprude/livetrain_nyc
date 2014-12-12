require 'csv'
Dir["./models/*.rb"].each {|file| require file }

# CSV.foreach('stations.csv') do |row|
#   options = {}
#   options[:mta_id] = row[0]
#   options[:name] = row[1]
#   options[:lat] = row[2]
#   options[:lng] = row[3]
#   Station.create(options)
# end

lines = [
  { line: '1', color: '#EE352E' },
  { line: '2', color: '#EE352E' },
  { line: '2X', color: '#EE352E' },
  { line: '3', color: '#EE352E' },
  { line: '3X', color: '#EE352E' },
  { line: '4', color: '#00933C' },
  { line: '5', color: '#00933C' },
  { line: '5X', color: '#00933C' },
  { line: '6', color: '#00933C' },
  { line: '6X', color: '#00933C' },
  { line: 'S', color: '#808183' },
  { line: 'L', color: '#A7A9AC' },
]

lines.each { |line| Line.create(line) }