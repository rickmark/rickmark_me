class CreateBlogs < ActiveRecord::Migration
  def change
    create_table :blogs do |t|
      t.string :title
      t.string :lead
      t.text :contents

      t.timestamps null: false
    end
  end
end
