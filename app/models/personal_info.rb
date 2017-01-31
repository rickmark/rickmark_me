class PersonalInfo
  attr_accessor :first_name
  attr_accessor :last_name
  attr_accessor :email_address
  attr_accessor :location_name
  attr_accessor :latitude, :longitude
  attr_accessor :phone_number
  attr_accessor :website
  attr_accessor :print_url
  attr_accessor :social_links
  attr_accessor :pgp_key

  def initialize(data)
    @first_name = data[:first_name]
    @last_name = data[:last_name]
    @location_name = data[:location]
    @phone_number = data[:telephone_number]
    @email_address = data[:email_address]
    @website = data[:website_url]
    @print_url = data[:resume_print_url]
    @pgp_key = data[:pgp_key]

    @latitude = data[:latitude]
    @longitude = data[:longitude]

    @social_links = (data[:social_links] || []).map { |item| SocialLink.new item }
  end

  def full_name
    "#{first_name} #{last_name}"
  end

  def email_link
    "mailto:#{email_address}"
  end

  def phone_link
    "tel:+#{phone_number.tr('^A-Za-z0-9', '')}"
  end
end
