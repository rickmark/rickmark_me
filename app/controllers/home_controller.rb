class HomeController < ApplicationController
  #layout 'coming_soon'
  
  def index
    @articles = Article.all
  end

end
