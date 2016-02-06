class Message < ActiveRecord::Base

  validates_presence_of :name, :email, :message, :origin_ip, :origin_user_agent
end