class AssetsController < ApplicationController
  def show
    @asset = BlogAsset.find(params[:id])

    render status: 404 and return unless @asset

    send_data @asset.content, type: @asset.content_type
  end
end
