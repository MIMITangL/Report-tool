const CACHE_NAME = 'aviation-report-app-v1';
const ASSETS_TO_CACHE = [
  '.',
  'report-tool.html',
  'manifest.json',
  'icon-192x192.png',
  'icon-512x512.png'
];

// 安装service worker并缓存资源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('缓存已打开');
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
  self.skipWaiting();
});

// 激活service worker并清理旧缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('删除旧缓存:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
  );
  self.clients.claim();
});

// 拦截请求并从缓存提供资源
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // 如果缓存中有匹配的资源，则返回它
        if (response) {
          return response;
        }
        // 否则，尝试从网络获取
        return fetch(event.request)
          .then((networkResponse) => {
            // 如果网络响应有效，则将其克隆并添加到缓存
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });
            }
            return networkResponse;
          })
          .catch((error) => {
            console.error('获取资源失败:', error);
            // 可以在这里返回一个离线备用页面
          });
      })
  );
});
