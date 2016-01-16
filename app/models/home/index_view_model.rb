module Home
  class IndexViewModel
    extend Forwardable

    def initialize
      @resume = Resume.new
    end

    def_delegators :@resume, :work_history, :hobbies, :skills, :projects
  end
end