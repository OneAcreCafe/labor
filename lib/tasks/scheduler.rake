task :'send-weekly-schedule' => :environment do
  if Time.now.sunday?
    Rake::Task["email:schedule"].invoke
  end
end
