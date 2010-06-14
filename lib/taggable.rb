module Taggable
  def self.included(base)
    base.class_eval do
      has_many :tag_usages, :as => :taggable
      include InstanceMethods
    end
  end

  module InstanceMethods
    def tag_names
      tag_usages.collect{ |tu| tu.tag.name }.join(', ')
    end

    def tag_names=(value)
      tags = value.split(', ').collect{ |tag| Tag.find_or_create_by_name(tag) }
      tag_usages.each do { |tu| tu.destroy }
      tags.each { |tag| tag_usages.build(:tag => tag) }
    end
  end
end