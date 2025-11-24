# 手机测试指南 📱

本文档介绍如何在手机上测试《左右手无聊搏击》H5 游戏。

## 方法一：本地网络测试（推荐，最简单）✨

### 准备工作
1. 确保手机和电脑连接在**同一个 WiFi 网络**下
2. 在电脑上启动一个本地服务器

### 步骤

#### 1. 启动本地服务器

**使用 Python（Python 3）**：
```bash
# 进入游戏目录
cd left-right-boxing

# Python 3
python -m http.server 8000

# 或者 Python 2
python -m SimpleHTTPServer 8000
```

**使用 Node.js（如果已安装）**：
```bash
# 安装 http-server（如果还没安装）
npm install -g http-server

# 进入游戏目录并启动
cd left-right-boxing
http-server -p 8000
```

**使用 VS Code（最简单）**：
1. 安装 "Live Server" 扩展
2. 右键点击 `index.html`
3. 选择 "Open with Live Server"
4. 自动在浏览器中打开

#### 2. 获取电脑 IP 地址

**Windows**：
```bash
ipconfig
```
查找 "IPv4 地址"，例如：`192.168.1.100`

**Mac/Linux**：
```bash
ifconfig
# 或者
ip addr show
```
查找局域网 IP，通常在 `192.168.x.x` 或 `10.0.x.x`

#### 3. 在手机上访问

在手机浏览器（Chrome、Safari 等）中输入：
```
http://你的电脑IP:8000
```
例如：`http://192.168.1.100:8000`

#### 4. 注意事项
- ✅ 确保电脑防火墙允许 8000 端口访问
- ✅ 确保手机和电脑在同一 WiFi
- ❌ 不支持 HTTPS，所以 PWA 的 Service Worker 可能无法完全工作（但游戏可以正常游玩）

---

## 方法二：内网穿透（支持 HTTPS，PWA 完整功能）🔐

使用内网穿透工具可以生成一个公网可访问的 HTTPS 链接，适合测试 PWA 完整功能。

### 使用 ngrok（推荐）

#### 1. 下载 ngrok
访问：https://ngrok.com/download

#### 2. 注册并获取 token
1. 注册 ngrok 账号（免费）
2. 获取 authtoken
3. 配置：
```bash
ngrok config add-authtoken YOUR_TOKEN
```

#### 3. 启动本地服务器
```bash
# 先启动本地服务器（见方法一）
cd left-right-boxing
python -m http.server 8000
```

#### 4. 启动 ngrok
```bash
# 在另一个终端运行
ngrok http 8000
```

#### 5. 获取访问链接
ngrok 会显示类似这样的信息：
```
Forwarding   https://xxxx-xx-xx-xx-xx.ngrok-free.app -> http://localhost:8000
```

**复制 HTTPS 链接**（如：`https://xxxx.ngrok-free.app`），在手机上访问即可！

#### 优点
- ✅ 支持 HTTPS（PWA 完整功能）
- ✅ 可以从任何网络访问
- ✅ 可以分享给朋友测试

### 其他内网穿透工具
- **localtunnel**（免费，简单）
- **cloudflared**（Cloudflare Tunnel，免费）
- **serveo**（免费，无需注册）

---

## 方法三：快速在线部署（最方便）🚀

### 使用 Netlify Drop（最简单）

1. 访问：https://app.netlify.com/drop
2. 将整个 `left-right-boxing` 文件夹**拖拽**到页面上
3. 等待部署完成（几秒钟）
4. 获得一个类似 `xxx.netlify.app` 的链接
5. **在手机上直接访问这个链接**即可！

#### 优点
- ✅ 免费
- ✅ 自动提供 HTTPS
- ✅ 无需注册（可选）
- ✅ 部署快速（几秒钟）
- ✅ 可以分享给任何人

### 使用 Vercel

1. 访问：https://vercel.com
2. 注册/登录
3. 点击 "Add New Project"
4. 上传 `left-right-boxing` 文件夹
5. 部署完成，获得链接

### 使用 GitHub Pages

1. 将代码推送到 GitHub 仓库
2. 在仓库设置中启用 GitHub Pages
3. 选择 main 分支
4. 获得类似 `username.github.io/repo-name` 的链接

---

## 方法四：直接打开本地文件（不推荐）📂

### 为什么不太推荐？
- ❌ Service Worker 不会工作（file:// 协议不支持）
- ❌ 某些浏览器可能有安全限制
- ❌ PWA 功能无法测试

### 如果必须使用：

1. 将整个 `left-right-boxing` 文件夹复制到手机
2. 使用手机文件管理器打开
3. 点击 `index.html` 文件
4. 选择用浏览器打开

---

## 测试检查清单 ✅

### 基础功能测试
- [ ] 游戏可以正常加载
- [ ] 武器选择界面正常显示
- [ ] 虚拟按钮可以正常显示（移动端）
- [ ] 触摸控制可以正常操作
- [ ] 游戏可以正常进行
- [ ] 收集物正常显示和收集
- [ ] 计时器正常工作
- [ ] 游戏结束界面正常显示

### 响应式测试
- [ ] Canvas 自适应屏幕尺寸
- [ ] 在不同尺寸的手机上测试（小屏、大屏）
- [ ] 横屏和竖屏切换测试
- [ ] UI 元素不会溢出或重叠

### PWA 功能测试（需要 HTTPS）
- [ ] 浏览器提示"添加到主屏幕"
- [ ] 可以成功添加到主屏幕
- [ ] 图标正确显示
- [ ] 离线时可以正常游玩（需要先访问一次）

### 性能测试
- [ ] 游戏运行流畅（60fps）
- [ ] 触摸响应及时
- [ ] 没有明显的卡顿

---

## 常见问题排查 🔧

### 1. 手机无法访问电脑的本地服务器

**问题**：输入 IP 地址后无法打开

**解决方案**：
- 检查手机和电脑是否在同一 WiFi
- 检查防火墙设置（允许 8000 端口）
- 尝试更换端口号（如 8080、3000）
- 使用 `0.0.0.0` 作为主机地址：
  ```bash
  python -m http.server 8000 --bind 0.0.0.0
  ```

### 2. Service Worker 无法注册

**问题**：浏览器控制台显示 Service Worker 注册失败

**解决方案**：
- 需要使用 HTTPS（使用 ngrok 或在线部署）
- 或者使用 localhost（仅限本机）
- 检查 service-worker.js 文件路径是否正确

### 3. 虚拟按钮不显示

**问题**：移动端看不到虚拟方向按钮

**解决方案**：
- 检查浏览器窗口宽度是否小于 900px
- 打开浏览器开发者工具，检查 CSS 是否正确加载
- 检查 `.mobile-controls` 元素的 `display` 属性

### 4. 触摸控制无效

**问题**：点击虚拟按钮没有反应

**解决方案**：
- 打开浏览器控制台检查是否有 JavaScript 错误
- 检查 `bindTouchControls()` 函数是否被调用
- 检查按钮的 `data-key` 属性是否正确

### 5. Canvas 显示异常

**问题**：游戏画面模糊或尺寸不对

**解决方案**：
- 刷新页面
- 检查浏览器是否支持 Canvas
- 检查 `resizeCanvas()` 函数是否正常工作

---

## 推荐测试流程 📋

### 快速测试（5分钟）
1. 使用方法一（本地网络）快速验证基础功能
2. 测试虚拟按钮是否显示和可用
3. 测试游戏是否能正常运行

### 完整测试（30分钟）
1. 使用方法二或三（HTTPS 环境）
2. 测试所有基础功能
3. 测试 PWA 功能（添加到主屏幕）
4. 测试离线功能
5. 在不同手机型号上测试

---

## 测试工具推荐 🛠️

### 浏览器开发者工具（远程调试）

**Chrome DevTools（推荐）**：
1. 在电脑 Chrome 中打开：`chrome://inspect`
2. 在手机 Chrome 中启用"USB 调试"（Android）
3. 用 USB 连接手机到电脑
4. 在电脑上可以看到手机页面，可以调试

**Safari Web Inspector（iOS）**：
1. 在手机上启用"Web Inspector"（设置 > Safari > 高级）
2. 用 USB 连接 iPhone 到 Mac
3. 在 Mac Safari 中：开发 > [你的 iPhone] > [页面]

### 在线测试工具
- **BrowserStack**：在不同设备上测试（付费）
- **LambdaTest**：跨浏览器测试（付费）
- **Responsive Design Mode**：浏览器内置响应式测试

---

## 总结

**最快测试方法**：Netlify Drop（3 分钟搞定）
**最推荐方法**：本地网络 + ngrok（支持完整 PWA 功能）

选择最适合你的方法开始测试吧！🎮
