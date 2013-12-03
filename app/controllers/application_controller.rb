class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception

  # https://github.com/ryanb/cancan/issues/835#issuecomment-18663815
  before_filter do
    resource = controller_name.singularize.to_sym
    method = "#{resource}_params"
    params[resource] &&= send(method) if respond_to?(method, true)
  end

  rescue_from CanCan::AccessDenied do |exception|
    flash[:alert] = "Access denied."
    redirect_to new_user_registration_url
  end

  # https://github.com/plataformatec/devise/wiki/How-To%3A-redirect-to-a-specific-page-on-successful-sign-in
  def after_sign_in_path_for(resource)
    if session[:desired_shifts]
      session[:desired_shifts].try(:each) do |id|
        shift = Shift.find(id)
        shift.workers << current_user
      end
      session[:desired_shifts] = nil
    end

    request.env['omniauth.origin'] || stored_location_for(resource) || root_path
  end
end
