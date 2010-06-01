class Project < ActiveRecord::Base
  include Taggable

  scope :active, where(:active => true)

  def to_str
    name
  end
end
