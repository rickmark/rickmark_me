WwwRichardpenwellMe::Application.routes.draw do |map|

  resources :articles

  root :to => "home#index"
end
