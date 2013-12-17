class ScheduleMailer < ActionMailer::Base
  default from: 'volunteer@oneacrecafe.org'

  def schedule_email(user, shifts)
    @user = user
    @shifts = shifts
    mail(to: @user.email, subject: '[OAC] Weekly Schedule')
  end
end
