require 'rails_helper'

RSpec.describe AssetsController, type: :controller do

  describe 'GET #show' do
    it 'returns http success' do
      expect(BlogAsset).to receive(:find).with('1') { BlogAsset.new content_type: 'image/jpeg', content: '' }

      get :show, params: { id: 1, article_id: 1 }

      expect(response).to have_http_status(:success)
    end

    it 'returns 404 if the asset isn\'t found' do
      expect(BlogAsset).to receive(:find).with('1') { nil }

      get :show, params: { id: 1, article_id: 1 }

      expect(response).to have_http_status(:not_found)
    end
  end

end
