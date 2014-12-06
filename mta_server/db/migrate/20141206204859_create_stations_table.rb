class CreateStationsTable < ActiveRecord::Migration
  def change
    create_table :stations do |t|
      t.string :name
      t.string :mta_id
      t.float :lat
      t.float :lng
      t.timestamps
    end
  end
end
