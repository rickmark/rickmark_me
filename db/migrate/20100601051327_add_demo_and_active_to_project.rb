class AddDemoAndActiveToProject < ActiveRecord::Migration
  def self.up
    add_column :projects, :active, :boolean
    add_column :projects, :demo_url, :string
  end

  def self.down
    remove_column :projects, :demo_url
    remove_column :projects, :active
  end
end
