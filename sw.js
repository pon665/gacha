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

// 🎯 キャッシュのインストール（新しいバージョンのキャッシュを適用）
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(urlsToCache);
        })
    );
    self.skipWaiting(); // 🎯 インストール後すぐに新しいバージョンを適用
});

// 🎯 オフライン対応（ネットワークエラー時は `offline.html` を返す）
self.addEventListener("fetch", event => {
    event.respondWith(
        fetch(event.request).then(response => {
            return caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, response.clone());
                return response;
            });
        }).catch(() => {
            return caches.match(event.request).then(response => {
                return response || caches.match("offline.html");
            });
        })
    );
});

// 🎯 古いキャッシュを削除して、新しいキャッシュを適用
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
        }).then(() => self.clients.claim()) // 🎯 新しいキャッシュを即時適用
    );
});