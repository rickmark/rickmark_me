class AddMessages < ActiveRecord::Migration[5.0]
  def change
    create_table :messages, id: :uuid do |t|
      t.string :email
      t.string :name
      t.string :message
      t.string :origin_ip
      t.string :origin_user_agent
    end
  end
end
