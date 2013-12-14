require 'test_helper'
include ShiftsHelper

class ShiftTest < ActiveSupport::TestCase
  test "days size" do
    start_date = Time.new
    end_date = start_date + 1.week
    assert_equal 8, days(start_date, end_date).count

    date_format = '%Y/%m/%d'
    start_date = DateTime.strptime('2013/12/16', date_format)
    end_date = DateTime.strptime('2013/12/20', date_format)
    assert_equal 5, days(start_date, end_date).count
  end
end
