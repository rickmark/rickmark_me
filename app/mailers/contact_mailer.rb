class ContactMailer < ApplicationMailer
  def contact_message(database_message)
    @name     = database_message.name
    @email    = database_message.email
    @message  = database_message.message
    @id       = database_message.to_param

    mail to: 'info@rickmark.me', subject: "RickMark: New Inquiry from #{database_message.name}"
  end
end
