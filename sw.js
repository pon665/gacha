const CACHE_NAME = "gacha-cache-v1";
const urlsToCache = [
    "index.html",
    "history.html",
    "manifest.json",
    "service-worker.js",
    "style.css",
    "history.css",
    "script.js",
    "history.js",
    "back.png",
    "icon-192x192.png",
    "icon-512x512.png"
];


// インストール時にキャッシュする
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// ネットワークが使えない場合はキャッシュを使用
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// 古いキャッシュの削除
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

self.addEventListener("push", (event) => {
    const options = {
        body: "アプリをインストールして、もっと便利に！",
        icon: "icon-192.png",
        vibrate: [200, 100, 200],
        actions: [
            { action: "install", title: "インストールする" }
        ]
    };

    event.waitUntil(
        self.registration.showNotification("ガチャメーカー", options)
    );
});

self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    if (event.action === "install" && deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === "accepted") {
                console.log("PWA Installed");
            }
        });
    }
});