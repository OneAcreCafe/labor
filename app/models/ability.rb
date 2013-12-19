class Ability
  include CanCan::Ability
  
  def initialize(user)
    user ||= User.new # guest user
    
    if user.role? :admin
      can :manage, :all
    else
      can :read, :all
      can :create, Drop

      if user.role? :manager
        can :manage, [Shift, Task, User, Drop]
      else
        cannot :read, User
      end
    end
  end
end
