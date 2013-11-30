class CreateShiftsUsers < ActiveRecord::Migration
  def change
    create_table :shifts_users do |t|
      t.references :shift, index: true
      t.references :user, index: true
    end
  end
end
