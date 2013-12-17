class AddUserToDrop < ActiveRecord::Migration
  def change
    add_reference :drops, :user, index: true
  end
end
