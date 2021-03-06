include ActiveAdminHelper

ActiveAdmin.register Blog do
  config.per_page = 20
  config.sort_order = 'date_desc'

  filter :title

  scope :all, default: true
  Category.find_each do |c|
    scope c.name do |s|
      s.where(category_id: c.id)
    end
  end

  controller do
    def permitted_params
      params.permit(:id, blog: [:title, :author, :workstream, :summary, :content, :id, :image, :date,
                    :issuu_link, :published, :custom_author, :category_id, :is_featured, :position,
                    tagged_items_attributes: [:tag_id, :id, :_destroy],
                    featured_position_attributes: [:id, :position, :_destroy],
                    country_ids: [],
                    region_ids: []])
    end

    def scoped_collection
      super.includes(:countries, :regions)
    end
  end

  index do
    selectable_column
    column :category
    column :title do |blog|
      link_to blog.title, admin_blog_path(blog)
    end
    column :summary
    column :published
    column :is_featured
    column :countries
    column :regions
    column :updated_at
    column :date do |blog|
      ActiveAdminHelper.format_date(blog.date)
    end
    actions do |blog|
      item 'Preview', insights_show_path(category: 'blog', slug: blog.slug, entity: 'blog', preview: true), class: 'member_link'
    end
  end

  form multipart: true do |f|
    f.semantic_errors *f.object.errors.keys
    f.inputs 'Blog details' do
      f.input :category_id,
              as: :select,
              collection: Category.all,
              include_blank: false
      f.input :title
      f.input :author, as: :select, collection: Member.all.pluck(:name)
      f.input :custom_author, placeholder: 'This will take priority over author.'
      f.input :published
      f.input :is_featured
      f.input :workstream
      f.input :summary
      f.input :content, as: :ckeditor, input_html: { ckeditor: { height: 400 } }
      f.has_many :tagged_items, allow_destroy: true, new_record: true, heading: 'Tags' do |a|
        a.input :tag_id, as: :select, collection: Tag.all, allow_destroy: true
      end
      f.input :date, as: :date_picker
      f.input :issuu_link
      f.input :countries, as: :check_boxes, collection: Country.pluck(:name, :id)
      f.input :regions, as: :check_boxes, collection: Region.pluck(:name, :id)
      f.input :image, as: :file, hint: f.object.image.present? ? \
        image_tag(f.object.image.url(:thumb)) : content_tag(:span, 'No image yet')
      # Will preview the image when the object is edited
      li "Created at #{f.object.created_at}" unless f.object.new_record?
      li "Updated at #{f.object.updated_at}" unless f.object.new_record?
    end

    f.actions
  end

  show do |ad|
    attributes_table do
      row :category
      row :title
      row :author
      row :custom_author
      row :published
      row :is_featured
      row :position do
        ActiveAdminHelper.position(ad.featured_position)
      end
      row :workstream
      row :summary
      row :tags do
        ActiveAdminHelper.tags_names(ad.tags)
      end
      row :content
      row :date do
        ActiveAdminHelper.format_date(ad.date)
      end
      row :issuu_link
      row :countries
      row :regions
      row :image do
        image_tag(ad.image.url(:thumb)) unless ad.image.blank?
      end
      # Will display the image on show object page
    end
  end
end
