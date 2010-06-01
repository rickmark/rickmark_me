class AddHiddenToArticle < ActiveRecord::Migration
  def self.up
    add_column :articles, :hidden, :boolean
  end

  def self.down
    remove_column :articles, :hidden
  end
end
