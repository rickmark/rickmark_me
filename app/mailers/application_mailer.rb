class ApplicationMailer < ActionMailer::Base
  default from: 'website@send.rickmark.me'

  layout 'mailer'
end
