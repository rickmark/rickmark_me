module SocialLinkHelper
  def social_link(model)
    link_to "<i class=\"fa fa-#{h model.name}\"></i>".html_safe, model.url
  end
end