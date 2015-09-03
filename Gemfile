source 'http://rubygems.org'

gem 'rails'

# Data Storage Layer
gem 'mongoid-rails'

# Asset Pipeline
gem 'uglifier'
gem 'sass-rails'
gem 'haml-rails'
gem 'sprockets-rails'
gem 'coffee-rails'
gem 'bootstrap-sass'

# Other
gem 'tzinfo-data', platforms: [:mingw, :mswin]
gem 'color-tools', :require => 'color'
gem 'RedCloth'

# Process Management
gem 'foreman'

# Deployment
gem 'capistrano'
gem 'capistrano-rails'
gem 'capistrano-bundler'

# Testing
group :development, :test do
  gem 'factory_girl_rails'
  gem 'rspec-rails'
  gem 'cucumber-rails', require: false
end

group :production do
  gem 'puma'
  gem 'therubyracer'
end
