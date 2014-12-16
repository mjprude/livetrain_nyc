class AddIndexToMtaTripIdInTripsTable < ActiveRecord::Migration
  def change
    add_index :trips, :mta_trip_id
  end
end
