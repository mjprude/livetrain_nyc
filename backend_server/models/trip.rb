class Trip < ActiveRecord::Base
  has_many :stops, dependent: :destroy

  def set_last_stop_id

  end

  def set_last_stop_departure

  end

end