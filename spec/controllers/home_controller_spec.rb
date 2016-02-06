require 'rails_helper'

RSpec.describe HomeController, type: :controller do
  it 'should render' do
    get :home

    expect(response).to render_template 'index'
  end
end
