desc "E-mail tasks"

namespace :email do
  desc "Mail out a weekly schedule to all users"
  task :'schedule' => :environment do
    User.all.find_each do |user|
      start_date = Date.commercial(Date.today.year, 1 + Date.today.cweek, 1).to_datetime # Next Monday
      end_date = start_date + 1.week
      shifts = user.shifts.where('start >= ? AND start < ?', start_date, end_date)
      puts "Sending: " + user.email + ": " + shifts.count.to_s
      if shifts.count > 0
        ScheduleMailer.schedule_email(user, shifts, start_date, end_date).deliver
      end
    end
  end
end
