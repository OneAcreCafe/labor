class ReplaceDurationOnShift < ActiveRecord::Migration
  def change
    remove_column :shifts, :duration
    add_column :shifts, :end, :datetime
  end
end
