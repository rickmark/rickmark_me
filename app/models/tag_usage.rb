class TagUsage
  include Mongoid::Document

  belongs_to :tag
  belongs_to :taggable, polymorphic: true
end
