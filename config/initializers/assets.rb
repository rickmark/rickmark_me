# Be sure to restart your server when you modify this file.
Rails.application.config.tap do |config|
  # Version of your assets, change this if you want to expire all your assets.
  config.assets.version = '1.0'

  # Add additional assets to the assets load path
  # config.assets.paths << Emoji.images_path

  # Precompile additional assets.
  # application.js, application.css, and all non-JS/CSS in app/assets folder are already added.
  config.assets.precompile += %w( pace/pace.js blue.css custom.js pace.js pace-theme-corner-indicator.css )

  # This directory contains bower managed components
  config.assets.paths << Rails.root.join('vendor', 'assets', 'components')
end
