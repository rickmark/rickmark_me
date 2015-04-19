class CreateProjects < ActiveRecord::Migration
  def self.up
    create_table :projects do |t|
      t.string :name
      t.string :project_page
      t.string :source_control_type
      t.string :source_control_url
      t.text :description

      t.timestamps :null => false
    end
  end

  def self.down
    drop_table :projects
  end
end
