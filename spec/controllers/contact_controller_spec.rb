require 'rails_helper'

RSpec.describe ContactController, type: :controller do

  it 'should fail if the email address is not valid'
  it 'should fail if the email address is missing'
  it 'should fail if the name is missing'
  it 'should fail if the message is empty'
end
