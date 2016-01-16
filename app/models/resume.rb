class Resume
  def initialize
    resume_path = File.join(Rails.root, 'config', 'resume.yaml')

    data = YAML.load(File.read(resume_path))
    data.deep_symbolize_keys!

    @data = data[:resume]
  end

  def skills
    @data[:skills].map { |skill| Skill.new skill }
  end

  def hobbies
    @data[:hobbies]
  end

  def work_history
    @data[:work_history].map { |event| WorkHistoryEvent.new event }
  end

  def projects
    @data[:projects].map { |project| Project.new project }
  end
end