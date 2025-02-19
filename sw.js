const CACHE_NAME = "gacha-cache-v5"; // ✅ キャッシュ名を更新

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
    "/capsule192.png",
    "/capsule.png",
    "/sounds/gacha_start.mp3",
    "/sounds/result.mp3"
];

// ✅ インストール時にキャッシュを保存
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(urlsToCache);
        }).then(() => self.skipWaiting()) // ✅ すぐ適用
    );
});

// ✅ オフライン時でもページを開けるようにする
self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            return cachedResponse || fetch(event.request).then((networkResponse) => {
                return caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, networkResponse.clone());
                    return networkResponse;
                });
            });
        }).catch(() => {
            if (event.request.mode === "navigate") {
                return caches.match("/index.html"); // ✅ オフライン時に index.html を表示
            }
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
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim()) // ✅ すぐ反映
    );
});

// ✅ PWA通知の処理
self.addEventListener("notificationclick", (event) => {
    event.notification.close();

    if (event.action === "install") {
        self.clients.matchAll().then((clients) => {
            clients.forEach((client) => client.postMessage({ action: "install" }));
        });
    } else if (event.action === "dismiss") {
        self.clients.matchAll().then((clients) => {
            clients.forEach((client) => client.postMessage({ action: "dismiss" }));
        });
    }
});

// ✅ IndexedDB から履歴を取得する関数
function getOfflineGachaHistory() {
    return new Promise((resolve, reject) => {
        let request = indexedDB.open("GachaHistoryDB", 1);

        request.onsuccess = function(event) {
            let db = event.target.result;
            let transaction = db.transaction(["history"], "readonly");
            let store = transaction.objectStore("history");
            let results = [];

            store.openCursor().onsuccess = function(event) {
                let cursor = event.target.result;
                if (cursor) {
                    results.push(cursor.value);
                    cursor.continue();
                } else {
                    resolve(results);
                }
            };
        };

        request.onerror = function(event) {
            reject("⚠️ IndexedDBの取得エラー: " + event.target.error);
        };
    });
}

// ✅ `fetch` イベント内でIndexedDBのデータを提供
self.addEventListener("fetch", (event) => {
    if (event.request.url.endsWith("/history")) {
        event.respondWith(
            getOfflineGachaHistory().then((data) => {
                return new Response(JSON.stringify(data), {
                    headers: { "Content-Type": "application/json" }
                });
            }).catch(() => {
                return new Response(JSON.stringify([]), {
                    headers: { "Content-Type": "application/json" }
                });
            })
        );
    }
});