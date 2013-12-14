require 'test_helper'
include ShiftsHelper

class ShiftTest < ActiveSupport::TestCase
  test "days size" do
    start_date = Time.new
    end_date = start_date + 1.week
    assert_equal 7, days(start_date, end_date).count
  end
end
