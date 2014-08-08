RickMark::Application.routes.draw do

  resources :projects
  resources :articles
  resources :tags

  root :to => "home#index"
end
