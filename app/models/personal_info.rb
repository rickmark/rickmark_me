class PersonalInfo
  attr_accessor :first_name
  attr_accessor :last_name
  attr_accessor :email_address
  attr_accessor :location_name
  attr_accessor :latitude, :longitude
  attr_accessor :phone_number
  attr_accessor :website
  attr_accessor :print_url

  def initialize(data)

    @first_name = data[:first_name]
    @last_name = data[:last_name]
    @location_name = data[:location]
    @phone_number = data[:telephone_number]
    @email_address = data[:email_address]
    @website = data[:website]
    @print_url = data[:resume_print_url]

    @latitude = data[:latitude]
    @longitude = data[:longitude]
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