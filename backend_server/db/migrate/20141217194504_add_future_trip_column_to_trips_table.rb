class AddFutureTripColumnToTripsTable < ActiveRecord::Migration
  def change
    add_column :trips, :future_trip, :boolean
  end
end
