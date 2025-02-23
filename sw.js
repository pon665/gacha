const CACHE_NAME = "gacha-cache-v3";
const urlsToCache = [
    "index.html",
    "history.html",
    "manifest.json",
    "service-worker.js",
    "style.css",
    "history.css",
    "script.js",
    "history.js",
    "icon-192x192.png",
    "icon-512x512.png"
];

// 🎯 キャッシュのインストール
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(urlsToCache);
        })
    );
});

// 🎯 オフライン対応（キャッシュを使うが、更新があればネットワークから取得）
self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request).then(networkResponse => {
                return caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, networkResponse.clone());
                    return networkResponse;
                });
            });
        })
    );
});

// 🎯 古いキャッシュを削除（自己更新）
self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// 🎯 サービスワーカーの更新を即時反映
self.addEventListener("message", event => {
    if (event.data === "skipWaiting") {
        self.skipWaiting();
    }
});