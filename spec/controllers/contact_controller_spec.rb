require 'rails_helper'

RSpec.describe ContactController, type: :controller do
  DEFAULT_MODEL = { email: 'rickmark@outlook.com', name: 'Rick Mark', phone: '2069133215', message: 'Hello World' }

  it 'should succeed with a valid model' do
    post :create, params: { contact: @model }, headers: { HTTP_USER_AGENT: 'Some Browser', REMOTE_ADDR: '10.0.1.0' }

    expect(response.body).to eq 'SEND'
  end

  describe 'when the model is invalid' do
    before :each do
      @model = DEFAULT_MODEL.dup
    end

    after :each do
      assert_response :success
      expect(response.body).to eq 'ERROR'
    end

    it 'should fail if the email address is not valid' do
      @model[:email] = 'not_valid'

      post :create, params: { contact: @model }
    end

    it 'should fail if the email address is missing' do
      @model.delete :email

      post :create, params: @model
    end

    it 'should fail if the name is missing' do
      @model.delete :name

      post :create
    end

    it 'should fail if the message is empty' do
      @model[:message] = ''

      post :create
    end
  end
end
