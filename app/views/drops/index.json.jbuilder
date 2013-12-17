json.array!(@drops) do |drop|
  json.extract! drop, :shift_id, :time, :reason
  json.url drop_url(drop, format: :json)
end
