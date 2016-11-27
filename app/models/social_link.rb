class SocialLink
  attr_accessor :name
  attr_accessor :display
  attr_accessor :url

  def initialize(data)
    self.name = data[:name]
    self.display = data[:display] || self.name
    self.url = data[:url]
  end

  def to_s
    self.display
  end
end