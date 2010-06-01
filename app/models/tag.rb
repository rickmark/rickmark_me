class Tag < ActiveRecord::Base
  has_many :tag_usages

  def to_param
    name
  end
end
