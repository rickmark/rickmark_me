class Skill
  attr_reader :name
  attr_reader :score

  def initialize(skill)
    @name = skill[:name]
    @score = skill[:score]
  end
end