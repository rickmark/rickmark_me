class HomeController < ApplicationController

  def index
    render layout: 'home'
  end

  def contact
    params.accept(:email, :name , :content)
  end

end
