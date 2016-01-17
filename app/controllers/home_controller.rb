class HomeController < ApplicationController

  def index
    @view_model = Home::IndexViewModel.new

    render layout: 'home'
  end

  def contact
    params.accept(:email, :name , :content)
  end

end
