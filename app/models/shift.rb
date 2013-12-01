class Shift < ActiveRecord::Base
  belongs_to :task
  has_and_belongs_to_many :workers, -> { uniq }, class_name: "User"

  def needed
    (size || 0) - workers.count
  end

  def workers
    workers
  end
end
