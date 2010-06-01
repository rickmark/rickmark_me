WwwRichardpenwellMe::Application.routes.draw do |map|

  resources :articles

  resources :tags

  root :to => "home#index"
end
