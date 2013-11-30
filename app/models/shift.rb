class Shift < ActiveRecord::Base
  belongs_to :task
  has_and_belongs_to_many :workers, class_name: "User"
end
