class ScheduleMailer < ActionMailer::Base
  default from: 'volunteer@oneacrecafe.org'

  def schedule_email(user, shifts, start_date, end_date)
    @user = user
    @shifts = shifts
    @start = start_date
    @end = end_date
    mail(to: @user.email, subject: '[OAC] Weekly Schedule: ' + @start.strftime('%b %d'))
  end
end
