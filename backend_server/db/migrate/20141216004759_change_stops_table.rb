class ChangeStopsTable < ActiveRecord::Migration
  def change
    change_table :stops do |t|
      t.remove :station_id, :line_id, :numeric, :station_north, :station_south, :time_north, :time_south, :delay
      t.references  :trip
      t.string      :stop_id
      t.integer     :arrival_time
      t.integer     :departure_time
    end
  end
end
