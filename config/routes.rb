RickMark::Application.routes.draw do

  #resources :projects
  #resources :articles
  #resources :tags

  resource :contact, only: [ :create ]

  root :to => 'home#index'

end
