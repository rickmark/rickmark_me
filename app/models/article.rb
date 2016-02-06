class Article < ActiveRecord::Base
  has_many :comments

  scope :visible, -> { where(is_visible: true) }
end