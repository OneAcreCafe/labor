class AddIconToTasks < ActiveRecord::Migration
  def change
    add_column :tasks, :icon, :string
  end
end
