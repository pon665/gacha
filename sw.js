const CACHE_NAME = "gacha-cache-v2";
const urlsToCache = [
    "index.html",
    "history.html",
    "manifest.json",
    "service-worker.js",
    "style.css",
    "script.js",
    "icons/icon-192x192.png",
    "icons/icon-512x512.png"
];

// 🎯 キャッシュのインストール
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(urlsToCache);
        })
    );
});

// 🎯 オフライン対応
self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});

// 🎯 古いキャッシュの削除
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
        })
    );
});

// 🎯 PWA のインストールを促すプッシュ通知
self.addEventListener("push", event => {
    const options = {
        body: "📲 ガチャメーカーをインストールしてアプリで楽しもう！",
        icon: "icons/icon-192x192.png",
        badge: "icons/icon-192x192.png",
        actions: [
            { action: "install", title: "インストール" },
            { action: "dismiss", title: "後で" }
        ]
    };
    event.waitUntil(self.registration.showNotification("ガチャメーカー", options));
});

// 🎯 プッシュ通知のクリック処理
self.addEventListener("notificationclick", event => {
    event.notification.close();
    if (event.action === "install") {
        clients.openWindow("index.html");
    }
});