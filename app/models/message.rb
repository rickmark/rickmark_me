class Message
  include Mongoid::Document

  field :created_at, type: DateTime, default: Time.now.utc
  field :name
  field :email
  field :message
  field :origin_ip
  field :origin_user_agent

  validates_presence_of :created_at, :name, :email, :message, :origin_ip, :origin_user_agent
end