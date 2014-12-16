class Trip < ActiveRecord::Base
  has_many :stops
end