class CreateArticles < ActiveRecord::Migration
  def self.up
    create_table :articles do |t|
      t.string :subject
      t.text :body

      t.timestamps :null => false
    end
  end

  def self.down
    drop_table :articles
  end
end
