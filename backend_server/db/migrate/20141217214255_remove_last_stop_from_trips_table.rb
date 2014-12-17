class RemoveLastStopFromTripsTable < ActiveRecord::Migration
  def change
    remove_column :trips, :last_stop_id, :string
    remove_column :trips, :last_stop_departure, :integer
  end
end
