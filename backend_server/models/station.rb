class Station < ActiveRecord::Base
  has_many :stops
  has_many :lines, through: :stops
end