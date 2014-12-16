class CreateTripsTable < ActiveRecord::Migration
  def change
    create_table :trips do |t|
      t.string      :mta_trip_id
      t.integer     :stops_remaining
      t.integer     :mta_timestamp
      t.string      :route
      t.string      :direction
      t.string      :last_stop_id
      t.integer     :last_stop_departure

      t.timestamps
    end
  end
end
