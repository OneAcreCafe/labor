json.array!(@shifts) do |shift|
  json.extract! shift, :start, :duration, :task_id
  json.url shift_url(shift, format: :json)
end
