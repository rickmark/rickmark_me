require 'rails_helper'

describe 'home/index.html.haml' do
  it 'renders' do
    assign :view_model, Home::IndexViewModel.new

    render

    expect(rendered).to match /Skills/
  end
end