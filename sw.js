const CACHE_NAME = "gacha-cache-v2";
const urlsToCache = [
    "/",
    "/index.html",
    "/styles.css",
    "/script.js",
    "/histry.html",
    "/histry.css",
    "/histry.js",
    "/summary.html",
    "/summary.css",
    "/summary.js",
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

// インストール時にキャッシュを保存
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(urlsToCache);
        })
    );
});

// オフライン時でもキャッシュを提供
self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});

// キャッシュを更新
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});