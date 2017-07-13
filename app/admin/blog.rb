include ActiveAdminHelper

ActiveAdmin.register Blog do

  config.per_page = 20
  config.sort_order = 'date_desc'

  filter :title

  controller do
    def create
      if params[:commit] == 'Preview'
        session[:post] = permitted_params['blog']

        redirect_to updates_blogs_preview_path
      else
        super
      end
    end

    def update
      if params[:commit] == 'Preview'
        session[:post] = permitted_params['blog']

        redirect_to updates_blogs_preview_path
      else
        super
      end
    end

    def permitted_params
      params.permit blog: [:title, :author, :workstream, :summary, :content, :id, :image, :date, :issuu_link]
    end
  end

  index do
    selectable_column
    column :title do |blog|
      link_to blog.title, admin_blog_path(blog)
    end
    column :summary
    column :updated_at
    column :date do |blog|
    	ActiveAdminHelper.format_date(blog.date)
    end
    actions
  end


  form multipart: true do |f|
    f.semantic_errors *f.object.errors.keys
    f.inputs 'Blog details' do
      f.input :title
      f.input :author, as: :select, collection: Member.all.pluck(:name)
      f.input :workstream
      f.input :summary
      f.input :content, as: :ckeditor, input_html: { ckeditor: { height: 400 } }
      f.input :date, as: :date_picker
      f.input :issuu_link
      f.input :image, as: :file, hint: f.object.image.present? ? \
        image_tag(f.object.image.url(:thumb)) : content_tag(:span, 'No image yet')
      # Will preview the image when the object is edited
      li "Created at #{f.object.created_at}" unless f.object.new_record?
      li "Updated at #{f.object.updated_at}" unless f.object.new_record?
    end
    f.submit "Preview"
    f.actions
  end


  show do |ad|
    attributes_table do
      row :title
      row :author
      row :workstream
      row :summary
      row :content
      row :date do
      	ActiveAdminHelper.format_date(ad.date)
      end
      row :issuu_link
      row :image do
        image_tag(ad.image.url(:thumb)) unless ad.image.blank?
      end
      # Will display the image on show object page
    end
  end

end
