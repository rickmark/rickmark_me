class ApplicationController < ActionController::Base
  protect_from_forgery
  layout 'application'
  before_filter :authorize_crud

  SECURED_ACTIONS = [ :new, :edit, :create, :update ]

  def authorize_crud
     if SECURED_ACTIONS.include? action_name.to_sym
       authenticate_or_request_with_http_basic do |id, password|
         id == 'penwellr' && password == '8tb8h6z8'
       end
     end
  end
end
