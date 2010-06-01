class Project < ActiveRecord::Base
  include Taggable

  scope :active, where(:active => true)
end
