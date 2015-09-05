class ContactsController < ApplicationController
  def create
    @message = Message.new(params.permit(:name, :email, :message))
    @message.origin_ip = request.remote_ip
    @message.origin_user_agent = request.user_agent

    if @message.valid?
      @message.save

      if ContactMailer.contact_message(@message).deliver_now
        render text: 'SEND'
      else
        render text: 'ERROR'
      end
    end
  end
end