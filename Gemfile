source 'http://rubygems.org'

ruby '2.4.1'

gem 'rails'

# Data Storage Layer
gem 'pg'

# Asset Pipeline
gem 'uglifier'
gem 'sass-rails'
gem 'haml-rails'
gem 'sprockets-rails'
gem 'coffee-rails'
gem 'bootstrap-sass'
gem 'redcarpet'

# Process Management
gem 'foreman'

# Testing
group :development, :test do
  gem 'factory_girl_rails'
  gem 'rspec-rails'
  gem 'cucumber-rails', require: false
  gem 'rubocop'
end

group :production do
  gem 'puma'
  gem 'therubyracer'
  gem 'rails_12factor'
end
