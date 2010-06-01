class AddTaggableTypeToTagUsages < ActiveRecord::Migration
  def self.up
    add_column :tag_usages, :taggable_type, :string
  end

  def self.down
    remove_column :tag_usages, :taggable_type
  end
end
