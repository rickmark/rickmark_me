require 'rails_helper'

describe 'home/index.html.haml' do
  it 'renders' do
    assign :resume, Resume.new
    assign :articles, []

    render

    expect(rendered).to match /Skills/
  end
end