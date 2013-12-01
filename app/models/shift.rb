class Shift < ActiveRecord::Base
  belongs_to :task
  has_and_belongs_to_many :workers, -> { uniq }, class_name: "User"

  def needed
    (size || 0) - workers.count
  end

  def worker?(user)
    defined?(user) && workers.include?(user)
  end
end
