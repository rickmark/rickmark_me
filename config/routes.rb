Rails.application.routes.draw do
  resources :articles, only: [ :show, :index ] do
    resources :assets, only: [ :show ]
    resources :comments, only: [ :create ]
  end

  resource :contact, controller: :contact, only: [ :create ]

  get '/key' => 'home#key'

  root to: 'home#index'
end
