class CreateDrops < ActiveRecord::Migration
  def change
    create_table :drops do |t|
      t.references :shift, index: true
      t.datetime :time
      t.string :reason

      t.timestamps
    end
  end
end
