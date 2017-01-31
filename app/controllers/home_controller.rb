class HomeController < ApplicationController
  def index
    @resume = Resume.new
    @articles = Article.take(5)

    render layout: 'home'
  end

  def contact
    params.accept(:email, :name , :content)
  end

  def key
    @key = Resume.new.info.pgp_key

    render plain: @key
  end
end
