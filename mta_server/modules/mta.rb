module MTA
  class FeedParser

    def self.feed
      filenames = []
      Dir.glob('./mta_assets/feeds/*/*.json') do |file|
        filenames << [File.basename(file), File.dirname(file)]
      end
      filenames.sort! do |fileX, fileY|
        Time.parse(fileX[0].chomp('_realtime.json').gsub!('_', ' ').gsub!('.', ':')) <=> Time.parse(fileY[0].chomp('_realtime.json').gsub!('_', ' ').gsub!('.', ':'))
      end
      binding.pry
    end

  end
end