RickMark::Application.routes.draw do
  resources :articles, only: [ :show, :index ] do
    resources :assets, only: [ :show ]
    resources :comments, only: [ :create ]
  end

  resource :contact, only: [ :create ]

  root to: 'home#index'

end
