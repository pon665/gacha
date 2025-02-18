const CACHE_NAME = "gacha-cache-v4"; // ✅ キャッシュ名を更新
const CACHE_EXPIRATION = 7 * 24 * 60 * 60 * 1000; // ✅ 7日間キャッシュ

const urlsToCache = [
    "/",
    "/index.html",
    "/styles.css", 
    "/script.js",
    "/manifest.json", 
    "/back.PNG",
    "/images.png",
    "/image1.png",
    "/image2.png",
    "/image3.png",
    "/image4.png",
    "/image5.png",
    "/capsule,192.png",
    "/capsule.png",
    "/sounds/gacha_start.mp3",
    "/sounds/result.mp3"
];

// ✅ インストール時にキャッシュを保存
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(urlsToCache);
        }).then(() => self.skipWaiting()) // ✅ 即時適用
    );
});

// ✅ オンラインなら最新データ、オフラインならキャッシュを使用
self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                // ✅ キャッシュが古すぎる場合は削除
                const fetchTime = cachedResponse.headers.get("date");
                if (fetchTime && (Date.now() - new Date(fetchTime).getTime()) > CACHE_EXPIRATION) {
                    return fetch(event.request).then((networkResponse) => {
                        return caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, networkResponse.clone()); // ✅ 最新データを保存
                            return networkResponse;
                        });
                    });
                }
                return cachedResponse;
            }
            // ✅ オンラインなら最新データを取得
            return fetch(event.request).then((networkResponse) => {
                return caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, networkResponse.clone()); // ✅ 新しいキャッシュを保存
                    return networkResponse;
                });
            });
        })
    );
});

// ✅ 古いキャッシュを削除
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache); // ✅ 古いキャッシュを削除
                    }
                })
            );
        }).then(() => self.clients.claim()) // ✅ 即時反映
    );
});