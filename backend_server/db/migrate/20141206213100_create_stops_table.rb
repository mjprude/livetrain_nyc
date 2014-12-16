class CreateStopsTable < ActiveRecord::Migration
  def change
    create_table :stops do |t|
      t.references :station
      t.references :line
      t.integer :numeric
      t.integer :station_north
      t.integer :station_south
      t.integer :time_north
      t.integer :time_south
      t.integer :delay
      # all times in secons
      t.timestamps
    end
  end
end
