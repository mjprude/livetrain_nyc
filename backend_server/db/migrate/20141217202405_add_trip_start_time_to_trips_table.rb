class AddTripStartTimeToTripsTable < ActiveRecord::Migration
  def change
    add_column :trips, :start_time, :integer
  end
end
