class Drop < ActiveRecord::Base
  belongs_to :shift
  belongs_to :user

  validates :shift, :user, :time, presence: true

  validate do |drop|
    if drop.shift.drops.where(user: drop.user).count > 0
      return false
    end
    true
  end

  protected
  def unique_user
    false
  end
  
end
