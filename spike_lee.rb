require 'json'
require 'pry'

@files_array = []

Dir.glob('./feed_selection/*.json') do |file|
  @files_array << File.basename(file)
  puts 'Successfully read: ' + File.basename(file)
end

def get_ruby_hash(file_number)
  hash = JSON.parse(File.read("./feed_selection/#{@files_array[file_number]}"))
end

def get_trip_id(entity)
  if entity['trip_update']
    entity['trip_update']['trip']['trip_id']
  end
end

def human_time(computer_time)
  date, time, zone = Time.at(computer_time).to_s.split(' ')
  time
end


#### Comparing feeds for a given entity

def feed_compare_raw
  @updates = []
  @timestamps = []
  base_feed = get_ruby_hash(0)
  @tracked_trip_id = get_trip_id(base_feed['entity'][2])
  @updates << base_feed['entity'][2]
  @timestamps << base_feed['header']['timestamp']

  @files_array[1..-1].each_with_index do |file, index|
    feed = get_ruby_hash(index+1)
    puts feed['header']['timestamp']
    @timestamps << feed['header']['timestamp']
    feed['entity'].each do |entity|
      if get_trip_id(entity) == @tracked_trip_id
        @updates << entity
      end
    end
  end
  binding.pry
end

def feed_compare_human
  @updates = []
  @timestamps = []
  base_feed = human_feed(0)
  @tracked_trip_id = base_feed['entity'][2]['trip_id']
  @updates << base_feed['entity'][2]
  @timestamps << base_feed['header']['timestamp']

  @files_array[1..-1].each_with_index do |file, index|
    feed = human_feed(index+1)
    timestamp = feed['header']['timestamp']
    @timestamps << timestamp
    feed['entity'].each do |entity|
      entity['timestamp'] = timestamp
      if entity['trip_id'] == @tracked_trip_id
        @updates << entity
      end
    end
  end
  binding.pry
end

def convert_entities(entities)
  human_entities = []
  entities.each do |entity|
    if entity['trip_update']
      human_stop_time_update = []
      entity['trip_update']['stop_time_update'].each do |stop|
        humanized_stop_info = {}
        humanized_stop_info['stop_id'] = stop['stop_id'][0..-2]
        if stop['arrival']
          date, time, zone = Time.at(stop['arrival']['time']).to_s.split(' ')
          humanized_stop_info['arrival_time'] = time
        end
        if stop['departure']
          date, time, zone = Time.at(stop['departure']['time']).to_s.split(' ')
          humanized_stop_info['departure_time'] = time
        end
        human_stop_time_update << humanized_stop_info
      end
      human_trip_update = {
        'trip_id' => entity['trip_update']['trip']['trip_id'],
        'direction' => entity['trip_update']['trip']['trip_id'][-1],
        'route_id' => entity['trip_update']['trip']['route_id'],
        'stop_time_update' => human_stop_time_update
      }
    human_entities << human_trip_update
    end
  end
  human_entities
end

def human_feed(index)
  feed = get_ruby_hash(index)
  returned_hash = {}
  returned_hash['header'] = {
    'timestamp' => feed['header']['timestamp']
  }
  returned_hash['entity'] = convert_entities(feed['entity'])
  returned_hash
end

binding.pry

####################################################################################################
# Eventually use something like this to separate out delay alerts from trip_updates and vehicles
#
# hash['entity'][i].keys.include?('trip_update')
# hash['entity'][i].keys.include?('trip_update')
####################################################################################################