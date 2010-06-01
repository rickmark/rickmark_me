class HomeController < ApplicationController
  #layout 'coming_soon'
  
  def index
    @articles = Article.visible.order('updated_at').limit(5)
    @home_article = Article.find_by_subject('Home')
  end

end
