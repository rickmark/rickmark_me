class ArticlesController < ApplicationController
  def index
    @articles = Article.visible
    @title = "Article List"

    respond_to do |format|
      format.html
      format.xml { render :xml => @articles }
    end
  end

  def show
    @article = Article.find(params[:id])
    @title = @article.subject

    respond_to do |format|
      format.html
      format.xml { render :xml => @article }
    end
  end

  def new
    @article = Article.new

    respond_to do |format|
      format.html
      format.xml { render :xml => @article }
    end
  end

  def create
    @article = Article.new(article_attrs)

    respond_to do |format|
      if @article.save
        format.html { redirect_to(@article, :notice => 'Article was successfully created.') }
        format.xml { render :xml => @article, :status => :created, :location => @article}
      else
        format.html { render :action => :new }
        format.xml { render :xml => @article.errors, :status => :unprocessable_entity }
      end
    end
  end

  def edit
    @article = Article.find(params[:id])

    respond_to do |format|
      format.html
      format.xml { render :xml => @article }
    end
  end

  def update
    @article = Article.find(params[:id])

    respond_to do |format|
      if @article.update_attributes(article_attrs)
        format.html { redirect_to(@article, :notice => 'Article was successfully updated.') }
        format.xml { head :ok }
      else
        format.html { render :action => :edit }
        format.xml { render :xml => @article.errors, :status => :unprocessable_entity }
      end
    end
  end

  private
  def article_attrs
    params.require(:article).permit!
  end
end