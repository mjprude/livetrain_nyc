ActiveRecord::Base.establish_connection(ENV['DATABASE_URL'] || 'postgres://localhost/mta_realtime')

# ActiveRecord::Base.establish_connection({
#   adapter: 'postgresql',
#   database: 'mta_realtime'
#   })