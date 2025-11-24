// Service Worker 版本
const CACHE_VERSION = 'v1';
const CACHE_NAME = `boxing-game-${CACHE_VERSION}`;

// 需要缓存的文件列表
const FILES_TO_CACHE = [
    './',
    './index.html',
    './game.js',
    './style.css',
    './manifest.json',
    './icon-192.png',
    './icon-512.png'
];

// 安装 Service Worker
self.addEventListener('install', (event) => {
    console.log('Service Worker: 安装中...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: 缓存文件');
                return cache.addAll(FILES_TO_CACHE.map(url => new Request(url, {cache: 'reload'})));
            })
            .then(() => {
                // 强制激活新的 Service Worker
                return self.skipWaiting();
            })
    );
});

// 激活 Service Worker
self.addEventListener('activate', (event) => {
    console.log('Service Worker: 激活中...');
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    // 删除旧版本的缓存
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: 删除旧缓存', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
            .then(() => {
                // 立即控制所有客户端
                return self.clients.claim();
            })
    );
});

// 拦截网络请求
self.addEventListener('fetch', (event) => {
    // 只处理 GET 请求
    if (event.request.method !== 'GET') {
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // 如果缓存中有响应，返回缓存的响应
                if (response) {
                    return response;
                }
                
                // 否则从网络获取
                return fetch(event.request)
                    .then((response) => {
                        // 检查响应是否有效
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // 克隆响应（因为响应只能使用一次）
                        const responseToCache = response.clone();
                        
                        // 将响应添加到缓存
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });
                        
                        return response;
                    })
                    .catch(() => {
                        // 如果网络请求失败，可以返回一个离线页面
                        // 这里我们只返回错误
                        console.log('Service Worker: 网络请求失败');
                    });
            })
    );
});
