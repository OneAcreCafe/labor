desc "E-mail tasks"

namespace :email do
  desc "Mail out a weekly schedule to all users"
  task :'schedule' => :environment do
    User.all.each do |user|
      nextMonday = Date.commercial(Date.today.year, 1 + Date.today.cweek, 1).to_datetime
      shifts = user.shifts.where('start >= ? AND start < ?', nextMonday, nextMonday + 1.week)
      puts "Sending: " + user.email + ": " + shifts.count.to_s
      ScheduleMailer.schedule_email(user, shifts).deliver
    end
  end
end
