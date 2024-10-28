Jekyll::Hooks.register :posts, :pre_render do |post|
    # 使用 last_modified_at 或 date 作为 sort_date
    post.data['sort_date'] = post.data['last_modified_at'] || post.data['date']
end