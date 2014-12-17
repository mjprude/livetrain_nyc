class Trip < ActiveRecord::Base
  has_many :stops, dependent: :destroy

end