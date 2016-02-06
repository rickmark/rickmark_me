module ProjectsHelper
  def source_control(project)
    return "<em>unavailable</em>".html_safe unless project.source_control_url?

    return link_to(project.source_control_url, project.source_control_url)
  end
end
