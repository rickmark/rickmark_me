class CreateArticles < ActiveRecord::Migration
  def change
    enable_extension 'uuid-ossp'

    create_table :articles, id: :uuid do |t|
      t.string :title
      t.string :subtitle
      t.string :lead
      t.text :content
      t.binary :image
      t.string :image_type

      t.timestamps
    end

    create_table :comments, id: :uuid do |t|
      t.string :author
      t.text :content
      t.uuid :article_id

      t.timestamps
    end

    create_table :assets, id: :uuid do |t|
      t.string :name
      t.string :content_type
      t.binary :content
      t.uuid :article_id

      t.timestamps
    end
  end
end
