class CreateTagUsages < ActiveRecord::Migration
  def self.up
    create_table :tag_usages do |t|
      t.integer :tag_id
      t.integer :taggable_id

      t.timestamps :null => false
    end

    remove_column :tags, :taggable_id
  end

  def self.down
    drop_table :tag_usages

    add_column :tags, :taggable_id, :integer
  end
end
