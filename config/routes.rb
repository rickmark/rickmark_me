WwwRichardpenwellMe::Application.routes.draw do |map|
  resources :projects


  resources :articles

  resources :tags

  root :to => "home#index"
end
