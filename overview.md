# 修复概览：分类重复、分类折叠、音乐播放器图标

## 完成内容
1. **分类去重**
   - 修改 `themes/anime-business/layout/_partial/sidebar-right.ejs` 与 `themes/anime-business/layout/categories.ejs`
   - 不再直接遍历 `site.categories`，改用 JS Map 按分类名去重并合并文章数，再按中文排序。
   - 效果：右侧分类与全部分类页面均只显示 5 个唯一分类（计算机、教程、开发板、我的世界、小马梦幻城）。

2. **右侧分类卡片折叠**
   - 右侧「分类」widget 仅渲染前 5 个分类。
   - 当分类总数超过 5 个时，自动在底部显示「查看更多分类」链接，跳转到 `/categories/`。

3. **音乐播放器图标修复**
   - `themes/anime-business/layout/layout.ejs` 中右下角圆钮的 SVG 换成实心八分音符图标，并显式使用 `fill="currentColor"`。
   - 播放器按钮保持橙底白符，图标不再线条碎裂。

4. **构建与缓存**
   - `head.ejs` CSS 版本号 bump 至 `?v=20260826ac`。
   - 终止了占用 4000 端口的旧 hexo server 进程，执行 `rm -f db.json && hexo generate` 重新生成全站。
   - 已在后台重新启动 `hexo server -p 4000`，预览地址：http://localhost:4000

## 关键文件变更
- `themes/anime-business/layout/_partial/sidebar-right.ejs`
- `themes/anime-business/layout/categories.ejs`
- `themes/anime-business/layout/layout.ejs`
- `themes/anime-business/layout/_partial/head.ejs`

## 验证结果
- `public/categories/index.html` 仅包含 5 个不重复分类。
- `public/index.html` 右侧分类 widget 已去重，当前 5 个分类正好全部展示（未触发折叠）。
- 播放器按钮 SVG 已替换为实心音符。
