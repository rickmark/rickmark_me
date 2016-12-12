require 'rails_helper'

RSpec.describe HomeController, type: :controller do
  it 'should render' do
    get :index

    expect(response.status).to be(200)
  end
end
