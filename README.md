# Blog

https://xujinkai.net

随意 fork，注意修改 site.json 等文件，最好加个友链 :)

## 内容位置

常改内容集中在：

- src/posts/：博文 Markdown
- src/home/：首页各项目/介绍 Markdown 与 projects.js
- src/about.md：留言页正文
- site.json：站点信息、顶栏、底栏、第三方集成等

博文继续使用原有 frontmatter 合同，例如 permalink、title、tags、date、last_modified_at、emotag、toc、published。

## 相关命令

基于 Node.js 和 Astro 构建：

    npm install
    npm run dev
    npm run build
    npm run verify

生产构建仍然输出纯静态文件到 dist/。

## 更新日志

- 2026-09-19 迁移到 Astro，保留静态页面 URL、DOM/CSS 结构和文章 frontmatter 合同
- 2026-02-28 迁移到 11ty (Node.js) 生态
- 2023-06-30 删除过往git历史
- 2023-04-30 新版简洁风格网站
- 2016-06-30 第一版
