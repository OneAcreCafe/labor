desc "E-mail tasks"

namespace :email do
  desc "Mail out a weekly schedule to all users"
  task :'schedule' => :environment do
    User.all.each do |user|
      start_date = Date.commercial(Date.today.year, 1 + Date.today.cweek, 1).to_datetime # Next Monday
      end_date = nextMonday + 1.week
      puts "Sending: " + user.email + ": " + shifts.count.to_s
      shifts = user.shifts.where('start >= ? AND start < ?', start_date, end_date)
      if shifts.count > 0
        ScheduleMailer.schedule_email(user, shifts, start_date, end_date).deliver
      end
    end
  end
end
