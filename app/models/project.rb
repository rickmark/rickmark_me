class Project < ActiveRecord::Base
  include Taggable

  scope :active, where(:active => true)

  def to_str
    name
  end
  
  def to_html(length = nil)
    html = RedCloth.new(description).to_html
    html = html.truncate_html(length) if length
    html.html_safe
  end
end
