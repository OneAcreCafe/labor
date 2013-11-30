class AddSizeToShift < ActiveRecord::Migration
  def change
    add_column :shifts, :size, :integer
  end
end
