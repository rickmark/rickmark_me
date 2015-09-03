require 'truncate_html'

class Article
  include Mongoid::Document

  validates_presence_of :subject
  validates_presence_of :body

  default_scope -> { order('updated_at DESC') }
  scope :visible, -> { where(:hidden => false) }

  def to_html(length = nil)
    html = RedCloth.new(body).to_html
    html = html.truncate_html(length) if length
    html.html_safe
  end

  def to_param
    "#{id}-#{subject.downcase.gsub(/[^[:alnum:]]/,'-')}".gsub(/-{2,}/,'-')
  end

  def to_str
    subject
  end
end
