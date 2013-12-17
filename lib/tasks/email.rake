desc "E-mail tasks"

namespace :email do
  desc "Mail out a weekly schedule to all users"
  task :'schedule' => :environment do
    User.all.each do |user|
      @user = user
      nextMonday = Date.commercial(Date.today.year, 1 + Date.today.cweek, 1).to_datetime
      @shifts = user.shifts.where('start >= ? AND start < ?', nextMonday, nextMonday + 1.week)
      puts @user.email + ": " + @shifts.count.to_s
    end
  end
end
