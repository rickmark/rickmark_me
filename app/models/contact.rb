class Contact
  include Mongoid::Document

  attr_accessor :name, :email, :message

  validates_presence_of :name, :email, :message
end