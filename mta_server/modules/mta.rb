module MTA
  class FeedParser

    def self.feed
      filenames = []
      Dir.glob('./mta_assets/feeds/*/*.json') do |file|
        filenames << File.path(file)
      end
      filenames.sort! do |fileX, fileY|
        File.mtime(fileX) <=> File.mtime(fileY)
      end
      JSON.generate(human_feed(filenames[1]))
    end

    def self.get_ruby_hash(file)
      hash = JSON.parse(File.read(file))
    end

    def self.get_trip_id(entity)
      if entity['trip_update']
        entity['trip_update']['trip']['trip_id']
      end
    end

    def self.human_time(computer_time)
      date, time, zone = Time.at(computer_time).to_s.split(' ')
      time
    end

    def self.convert_entities(entities)
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
            'direction' => entity['trip_update']['stop_time_update'][0]['stop_id'][-1],
            'route_id' => entity['trip_update']['trip']['route_id'],
            'stop_time_update' => human_stop_time_update
          }
          human_entities << human_trip_update
        end
      end
      human_entities
    end

    def self.human_feed(file)
      feed = get_ruby_hash(file)
      returned_hash = {}
      returned_hash['header'] = {
        'timestamp' => feed['header']['timestamp']
      }
      returned_hash['entity'] = convert_entities(feed['entity'])
      returned_hash
    end


  end
end