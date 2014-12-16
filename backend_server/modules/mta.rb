module MTA
  # Used for trip generation when parsing raw feed
  # Use for full feed hash
  class Feed
    def self.mta_timestamp(feed_hash)
      feed_hash[:header][:timestamp]
    end
  end

  # Use for raw_feed[:entity] array entities
  class Entity
    def self.mta_trip_id(feed_entity)
      feed_entity[:trip_update][:trip][:trip_id]
    end

    def self.route(feed_entity)
      feed_entity[:trip_update][:trip][:route_id]
    end

    def self.start_date(feed_entity)
      feed_entity[:trip_update][:trip][:start_date]
    end

    def self.stops_remaining(feed_entity)
      feed_entity[:trip_update][:stop_time_update].count
    end

    def self.direction(feed_entity)
      feed_entity[:trip_update][:stop_time_update][0][:stop_id][-1]
    end
  end

  # Used for stop generation when parsing raw feed
  class Stop
    def self.stop_id(stop_time_update)
      stop_time_update[:stop_id]
    end

    def self.departure_time(stop_time_update)
      stop_time_update[:departure] ? stop_time_update[:departure][:time] : nil
    end

    def self.arrival_time(stop_time_update)
      stop_time_update[:arrival] ? stop_time_update[:arrival][:time] : nil
    end
  end

  # ***** OLD FEEDPARSER...may be obsolete...but is used to serve human-readable output ********
  class FeedParser

    def self.raw_feed
      File.read(find_most_recent_file)
    end

    def self.feed
      JSON.generate(human_feed(find_most_recent_file))
    end

    def self.line(route_id)
      feed = human_feed(find_most_recent_file)
      JSON.generate(feed['entity'].select { |entity| entity["route_id"] == route_id })
    end

    ### "Helper" methods

    def self.find_most_recent_file
      filenames = []
      Dir.glob('./mta_assets/feeds/*/*.json') do |file|
        filenames << File.path(file)
      end
      filenames.sort! do |fileX, fileY|
        File.mtime(fileX) <=> File.mtime(fileY)
      end
      filenames[1]
    end

    def self.get_ruby_hash(file)
      hash = JSON.parse(File.read(file))
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
          entity['trip_update']['stop_time_update'].slice(0..1).each do |stop|
            humanized_stop_info = {}
            humanized_stop_info['stop_id'] = stop['stop_id'][0..-2]
            if stop['arrival']
              humanized_stop_info['arrival_time'] = human_time(Time.at(stop['arrival']['time']))
            end
            if stop['departure']
              humanized_stop_info['departure_time'] = human_time(Time.at(stop['departure']['time']))
            end
            human_stop_time_update << humanized_stop_info
          end
          human_trip_update = {
            'trip_id' => entity['trip_update']['trip']['trip_id'],
            'direction' => entity['trip_update']['stop_time_update'][0]['stop_id'][-1],
            'route_id' => entity['trip_update']['trip']['route_id'],
            'stops_remaining' => entity['trip_update']['stop_time_update'].count,
            'stop_time_update' => human_stop_time_update,
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