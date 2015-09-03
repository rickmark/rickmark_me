RickMark::Application.routes.draw do

  resources :projects
  resources :articles
  resources :tags

  post '/contact', to: 'home#contact'

  root :to => 'home#index'

end
