class Tag
  has_many :tag_usages

  def to_param
    name
  end
end
