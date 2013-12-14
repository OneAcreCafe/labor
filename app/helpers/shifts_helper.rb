module ShiftsHelper
  def days(start_date, end_date)
    days = []
    (start_date.to_i .. end_date.to_i).step(24*60*60) do |timestamp|
      days << Time.at(timestamp)
    end
    days
  end
end
