
Rails.application.config.action_mailer.delivery_method = :smtp
Rails.application.config.action_mailer.smtp_settings = {
    :address        => 'smtp.office365.com',
    :port           => '587',
    :authentication => :login,
    :user_name      => 'website@noncesoft.com',
    :password       => '5XSzWw0;(U43U3h',
    :domain         => 'rickmark.com',
    :enable_starttls_auto => true
}