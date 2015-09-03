class HomeController < ApplicationController

  def index
    render layout: false
  end

  def contact
    params.accept(:email, :name , :content)
  end

end
