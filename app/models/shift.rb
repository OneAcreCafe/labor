# -*- coding: utf-8 -*-
class Shift < ActiveRecord::Base
  belongs_to :task
  has_and_belongs_to_many :workers, -> { uniq }, class_name: "User"
  has_many :drops

  def needed
    [size, (size || 0) - workers.count + drops.count].min
  end

  def worker?(user)
    defined?(user) && workers.include?(user)
  end

  def to_s
    start.strftime('%Y/%m/%d @ %H:%M') + "–" + self.end.strftime('%H:%M') + ": " + task.name
  end
end
