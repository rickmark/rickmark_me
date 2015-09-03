class Tag
  include Mongoid::Document

  has_many :tag_usages

  def to_param
    name
  end
end
