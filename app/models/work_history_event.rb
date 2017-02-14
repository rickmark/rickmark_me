class WorkHistoryEvent
  attr_reader :date
  attr_reader :location
  attr_reader :title
  attr_reader :name
  attr_reader :link

  def initialize(event)
    @name = event[:name]
    @location = event[:location]
    @title = event[:title]
    @date = event[:date]
    @link = event[:link]
  end
end
