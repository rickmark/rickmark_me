class ApplicationController < ActionController::Base
  protect_from_forgery
  layout 'application'
  before_filter :load_tags

  def load_tags
    @tags = Tag.all
  end

end
