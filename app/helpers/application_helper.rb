module ApplicationHelper
  RANDOM_COLORS = 10
  RANDOM_CHUNKS_MAX = 10
  RANDOM_CHUNKS_MIN = 3
  HEADER_WIDTH = 940

  def generate_random_color_palate
    color_palate = "<style>\n".html_safe
    10.times do |i|
      h = rand 100
      s = 20
      l = rand(35) + 55

      hsl = Color::HSL.new(h, s, l)
      color_palate << ".random_color_#{i} { background-color: #{hsl.html}; }\n".html_safe
    end

    color_palate << "</style>".html_safe
  end

  def generate_random_background_color
    h = rand 100
    s = 20
    l = rand(15) + 75

    hsl = Color::HSL.new(h,s,l)
    hsl.html.html_safe
  end

  def random_header_draw
    boxes = "<div class='header_random_boxs alpha grid_12 omega'>\n".html_safe
    size_so_far = 0

    chunks = []
    (RANDOM_CHUNKS_MIN + rand(RANDOM_CHUNKS_MAX - RANDOM_CHUNKS_MIN)).times do |i|
      chunks << rand
    end
    total_size = chunks.sum

    chunks.each do |chunk|
      chunk_color = rand RANDOM_COLORS
      chunk_size = (HEADER_WIDTH * (chunk / total_size)).to_i

      chunk_size = (HEADER_WIDTH - size_so_far) if chunks.last == chunk
      size_so_far += chunk_size
      boxes << "  <div class='random_color_#{chunk_color}' style='float: left; width: #{chunk_size}px;'></div>\n".html_safe
    end

    boxes << "</div>\n".html_safe
  end

  def random_subheading
    @excuses ||= load_excuses

    RedCloth.new(@excuses[rand @excuses.length]).to_html.html_safe
  end

  private
  def load_excuses
    File.open(File.expand_path('config/excuses.txt', Rails.root), 'r') do |f|
      @excuses = f.readlines
    end
  end
end
