require 'truncate_html'

class Article < ActiveRecord::Base
  validates_presence_of :subject
  validates_presence_of :body

  has_many :tag_usages, :as => :taggable

  scope :visible, where(:hidden => false)

  def to_html(length = nil)
    html = RedCloth.new(body).to_html
    html = html.truncate_html(length) if length
    html.html_safe
  end

  def to_param
    "#{id}-#{subject.downcase.gsub(/[^[:alnum:]]/,'-')}".gsub(/-{2,}/,'-')
  end
end
