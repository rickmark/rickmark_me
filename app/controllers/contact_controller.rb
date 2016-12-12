class ContactController < ApplicationController
  def create
    @message = Message.new params.permit(:name, :email, :message)

    @message.origin_ip          = request.remote_ip
    @message.origin_user_agent  = request.user_agent

    if @message.valid?
      @message.save

      render plain: 'SEND' and return if ContactMailer.contact_message(@message).deliver_later
    end

    render plain: 'ERROR'
  end
end