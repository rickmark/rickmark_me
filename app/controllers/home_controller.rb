class HomeController < ApplicationController
  def index
    @resume = Resume.new
    @articles = Article.take(5)

    render layout: 'home'
  end

  def contact
    params.accept(:email, :name , :content)
  end
end
