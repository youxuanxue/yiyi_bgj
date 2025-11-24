# H5 游戏部署指南 📱

本文档详细说明如何将《左右手无聊搏击》游戏部署为 H5 游戏。

## 快速测试（在手机上测试）

📱 **想在手机上测试？查看 [TESTING.md](./TESTING.md) 获取详细测试指南**

推荐方法：
1. **Netlify Drop**（最简单）：拖拽文件夹到 https://app.netlify.com/drop，3 分钟获得可访问链接
2. **本地网络**：在电脑上运行 `python -m http.server 8000`，手机访问 `http://你的IP:8000`
3. **ngrok**（支持 HTTPS）：使用内网穿透工具，获得 HTTPS 链接，可测试完整 PWA 功能

---

## 部署步骤概览

### 第一步：移动端适配优化 ✅

游戏当前只支持键盘控制，需要添加触摸控制支持才能在移动设备上正常游玩。

#### 需要优化的内容：
1. ✅ **触摸控制支持** - 添加虚拟按钮或触摸滑动控制
2. ✅ **响应式 Canvas** - 让画布自适应不同屏幕尺寸
3. ✅ **移动端 UI 优化** - 调整字体大小和布局
4. ✅ **横竖屏适配** - 优化游戏在不同方向的显示

### 第二步：PWA 支持（可选但推荐）✨

让游戏可以添加到手机主屏幕，像原生应用一样使用。

#### 需要添加的文件：
1. ✅ **manifest.json** - 定义应用名称、图标、启动画面等
2. ✅ **Service Worker** (可选) - 实现离线缓存和后台更新
3. ✅ **图标文件** - 不同尺寸的应用图标

### 第三步：性能优化 🚀

1. ✅ **资源压缩** - 压缩 JavaScript、CSS 文件
2. ✅ **懒加载** - 优化资源加载时机
3. ✅ **防抖节流** - 优化事件处理性能

### 第四步：部署到服务器 🌐

#### 部署选项：

**选项 1：GitHub Pages（免费，推荐用于演示）**
```bash
# 1. 将代码推送到 GitHub 仓库
git add .
git commit -m "部署 H5 游戏"
git push origin main

# 2. 在 GitHub 仓库设置中启用 GitHub Pages
# Settings > Pages > Source: main branch
```

**选项 2：Netlify（免费，简单）**
1. 访问 https://www.netlify.com
2. 拖拽 `left-right-boxing` 文件夹到部署区域
3. 自动生成访问链接

**选项 3：Vercel（免费，快速）**
```bash
# 安装 Vercel CLI
npm i -g vercel

# 在项目目录运行
cd left-right-boxing
vercel
```

**选项 4：传统 Web 服务器**
1. 将所有文件上传到服务器
2. 确保 Web 服务器支持 HTML5 和静态文件服务
3. 通过域名访问

### 第五步：测试和优化 ✅

1. ✅ **多设备测试** - 在不同手机和平板上测试
2. ✅ **浏览器兼容性** - 测试主流移动浏览器
3. ✅ **性能测试** - 检查加载速度和流畅度
4. ✅ **用户体验测试** - 确保操作流畅自然

## 详细优化步骤

### 1. 添加触摸控制

需要修改 `game.js` 添加触摸事件监听：
- 触摸开始事件
- 触摸移动事件
- 触摸结束事件
- 虚拟方向按钮（可选）

### 2. 响应式 Canvas

需要修改 `game.js` 和 `style.css`：
- 动态调整 Canvas 尺寸
- 保持游戏比例
- 适配不同屏幕尺寸

### 3. PWA 配置

创建 `manifest.json`：
```json
{
  "name": "左右手无聊搏击",
  "short_name": "搏击游戏",
  "description": "左右手对战小游戏",
  "start_url": "./index.html",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#ff6b9d",
  "icons": [...]
}
```

### 4. HTTPS 支持

PWA 功能需要 HTTPS：
- GitHub Pages 默认提供 HTTPS
- Netlify/Vercel 自动提供 HTTPS
- 传统服务器需要配置 SSL 证书

## 部署检查清单

- [ ] 移动端触摸控制已添加
- [ ] Canvas 响应式适配完成
- [ ] manifest.json 已创建
- [ ] 图标文件已准备
- [ ] Service Worker 已实现（可选）
- [ ] 代码已优化和压缩
- [ ] 多设备测试通过
- [ ] 部署到服务器
- [ ] HTTPS 配置完成
- [ ] 访问链接测试正常

## 技术支持

如遇到问题，请检查：
1. 浏览器控制台是否有错误
2. 网络请求是否正常
3. 文件路径是否正确
4. HTTPS 是否已配置（PWA 需要）

---

**注意**：部署前建议先完成移动端适配优化，确保游戏在手机上可以正常游玩！
