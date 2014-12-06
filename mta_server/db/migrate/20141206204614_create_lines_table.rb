class CreateLinesTable < ActiveRecord::Migration
  def change
    create_table :lines do |t|
      t.string :line
      t.string :mta_id
      t.timestamps
    end
  end
end
