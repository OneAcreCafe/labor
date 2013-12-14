class AddNamesToUsers < ActiveRecord::Migration
  def change
    add_column :users, :given_name, :string
    add_column :users, :family_name, :string
    add_column :users, :nickname, :srting
  end
end
