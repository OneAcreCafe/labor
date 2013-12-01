json.array!(@shifts) do |shift|
  json.extract! shift, :id, :start, :end, :task_id, :needed
  json.taken shift.worker?(current_user) ? true : false
  json.url shift_url(shift, format: :html)
end
