class HomeController < ApplicationController

  def index
    @articles = Article.visible.order('updated_at DESC').limit(5)
    @home_article = Article.find_by_subject('Home')
    @title = "Home"

    render layout: false
  end

end
