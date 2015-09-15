
Rails.application.config.action_mailer.delivery_method = :smtp
Rails.application.config.action_mailer.smtp_settings = {
    :address        => 'smtp.sendgrid.net',
    :port           => '587',
    :authentication => :login,
    :user_name      => 'rickmark-site',
    :password       => '5XSzWw0;(U43U3h',
    :domain         => 'site.rickmark.me',
    :enable_starttls_auto => true
}