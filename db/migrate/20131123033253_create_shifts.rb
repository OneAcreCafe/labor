class CreateShifts < ActiveRecord::Migration
  def change
    create_table :shifts do |t|
      t.datetime :start
      t.integer :duration
      t.references :task, index: true

      t.timestamps
    end
  end
end
