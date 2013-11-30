json.array!(@shifts) do |shift|
  json.extract! shift, :start, :end, :task_id
  json.url shift_url(shift, format: :html)
end
