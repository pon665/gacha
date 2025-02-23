// 🎯 ミュート状態の保存＆取得
let isMuted = JSON.parse(localStorage.getItem("isMuted")) || false;
let volume = 1.0; // 音量（0.0～1.0）

document.addEventListener("DOMContentLoaded", function () {
    // 🎯 ハンバーガーメニューの開閉処理
    const menuButton = document.querySelector(".hamburger-menu");
    const menuList = document.querySelector(".menu-list");

    if (menuButton && menuList) {
        menuButton.addEventListener("click", function (event) {
            event.stopPropagation();
            menuList.classList.toggle("show");
        });

        document.addEventListener("click", function (event) {
            if (!menuButton.contains(event.target) && !menuList.contains(event.target)) {
                menuList.classList.remove("show");
            }
        });
    }

    // 🎯 ミュート状態をUIに反映
    updateMuteUI();

    // 🎯 ミュートボタンの処理
    const muteButton = document.getElementById("mute-button");
    if (muteButton) {
        muteButton.addEventListener("click", function () {
            isMuted = !isMuted;
            localStorage.setItem("isMuted", JSON.stringify(isMuted));
            updateMuteUI();
        });
    }

    // 🎯 景品リスト＆履歴の初期化
    updateItemList();
});

// 🎯 ミュート状態をUIに適用
function updateMuteUI() {
    const muteButton = document.getElementById("mute-button");
    const muteStatus = document.getElementById("mute-status");

    if (muteButton && muteStatus) {
        muteButton.innerText = isMuted ? "🔇 ミュート中" : "🔊 ミュート解除中";
        muteStatus.innerText = isMuted ? "🔕 音なし" : "🔔 音あり";
    }
}

// 🎯 サウンド再生関数
function playSound(type) {
    if (JSON.parse(localStorage.getItem("isMuted"))) return;

    let audio;
    switch (type) {
        case "start":
            audio = new Audio("sounds/gacha_start.mp3");
            break;
        case "result":
            audio = new Audio("sounds/result.mp3");
            break;
        default:
            return;
    }

    audio.volume = volume;
    audio.play().catch(e => console.error(`🔊 サウンド再生エラー (${type}):`, e));
}

// 🎯 ガチャマシンのアニメーション
function startGachaAnimation() {
    const gachaImage = document.getElementById("gacha-frame");
    let index = 0;
    const images = ["image2.png", "image3.png", "image4.png", "image5.png"];

    if (window.animationInterval) {
        clearInterval(window.animationInterval);
    }

    window.animationInterval = setInterval(() => {
        gachaImage.style.opacity = 0;
        setTimeout(() => {
            gachaImage.src = images[index];
            gachaImage.style.opacity = 1;
        }, 150);
        index = (index + 1) % images.length;
    }, 420);
}

function stopGachaAnimation() {
    clearInterval(window.animationInterval);
    document.getElementById("gacha-frame").src = "image1.png";
}

// 🎯 ガチャを引く
function pullGacha() {
    const playerName = document.getElementById("player-name").value.trim();
    const count = parseInt(document.getElementById("gacha-count").value, 10);
    const resultPanel = document.getElementById("gacha-result-panel");
    const resultText = document.getElementById("result-text");
    const resultImage = document.getElementById("result-image");
    const playerNameDisplay = document.getElementById("player-name-display");

    if (!playerName) {
        alert("リスナー名を入力してください");
        return;
    }

    let items = JSON.parse(localStorage.getItem("items")) || [];
    if (items.length === 0) {
        alert("景品リストがありません。景品を追加してください。");
        return;
    }

    const totalRate = items.reduce((sum, item) => sum + item.rate, 0);
    if (totalRate !== 100) {
        alert(`景品の確率合計が100%ではありません（現在: ${totalRate.toFixed(2)}％）。`);
        return;
    }

    playSound("start");
    startGachaAnimation();

    let results = {};
    let probabilityTable = [];

    items.forEach(item => {
        for (let i = 0; i < item.rate * 100; i++) {
            probabilityTable.push(item.name);
        }
    });

    for (let i = 0; i < count; i++) {
        let selectedItem = probabilityTable[Math.floor(Math.random() * probabilityTable.length)];
        results[selectedItem] = (results[selectedItem] || 0) + 1;
    }

    setTimeout(() => {
        stopGachaAnimation();
        playSound("result");

        resultPanel.style.display = "block";
        resultText.innerHTML = "";
        Object.entries(results).forEach(([item, num]) => {
            const listItem = document.createElement("p");
            listItem.innerText = `${item} × ${num}`;
            resultText.appendChild(listItem);
        });
        playerNameDisplay.innerText = `リスナー名: ${playerName}`;
        resultImage.src = "images.png"; // 🎯 リザルト画像を追加

        let history = JSON.parse(localStorage.getItem("history")) || [];
        let existingHistory = history.find(h => h.player === playerName);

        if (existingHistory) {
            existingHistory.count += count;
            for (const [itemName, num] of Object.entries(results)) {
                existingHistory.results[itemName] = (existingHistory.results[itemName] || 0) + num;
            }
        } else {
            history.push({ player: playerName, count, results });
        }

        localStorage.setItem("history", JSON.stringify(history));
        updateHistory();
    }, 4800);
}

// 🎯 結果パネルを閉じる
function closeResultPanel() {
    document.getElementById("gacha-result-panel").style.display = "none";
}

// 🎯 景品リストの管理
function addItem() {
    let name = document.getElementById("item-name").value.trim();
    let rate = parseFloat(document.getElementById("item-rate").value);

    if (!name || rate <= 0 || rate > 100) {
        alert("正しい値を入力してください");
        return;
    }

    let items = JSON.parse(localStorage.getItem("items")) || [];
    items.push({ name, rate });
    localStorage.setItem("items", JSON.stringify(items));
    document.getElementById("item-name").value = "";
    document.getElementById("item-rate").value = "";
    updateItemList();
}

function deleteItem(index) {
    let items = JSON.parse(localStorage.getItem("items")) || [];
    if (!confirm(`${items[index].name} を削除しますか？`)) return;
    
    items.splice(index, 1);
    localStorage.setItem("items", JSON.stringify(items));
    updateItemList();
}

function updateItemList() {
    let items = JSON.parse(localStorage.getItem("items")) || [];
    const itemList = document.getElementById("item-list");
    itemList.innerHTML = "";
    
     items.sort((a, b) => a.name.localeCompare(b.name, 'ja'));

    items.forEach((item, index) => {
        const div = document.createElement("div");
        div.className = "item-row";
        div.innerHTML = `
            <span>${item.name} (確率: ${item.rate}%)</span>
            <button class="delete-button" onclick="deleteItem(${index})">削除</button>
        `;
        itemList.appendChild(div);
    });
}

document.addEventListener("DOMContentLoaded", function () {
    // ✅ X（Twitter）投稿ボタンの処理
    const postXButton = document.getElementById("post-x-button");
    if (postXButton) {
        postXButton.addEventListener("click", function () {
            const resultTextElement = document.getElementById("result-text");
            const playerNameElement = document.getElementById("player-name-display");

            if (!resultTextElement || !playerNameElement) {
                alert("⚠️ リスナー名またはガチャ結果が取得できません。");
                return;
            }

            const resultText = resultTextElement.innerText.trim();
            const playerName = playerNameElement.innerText.replace("リスナー名: ", "").trim();

            if (!resultText || !playerName) {
                alert("⚠️ リスナー名またはガチャ結果がありません。ガチャを引いてください。");
                return;
            }

            const tweetText = encodeURIComponent(`リスナー名: ${playerName}\nガチャ結果:\n${resultText}`);
            const tweetUrl = `https://twitter.com/intent/tweet?text=${tweetText}`;
            window.open(tweetUrl, "_blank");
        });
    }

    // ✅ 閉じるボタンの処理
    const closeButton = document.getElementById("close-button");
    if (closeButton) {
        closeButton.addEventListener("click", function () {
            document.getElementById("gacha-result-panel").style.display = "none";
        });
    }
});

document.addEventListener("DOMContentLoaded", function () {
    const resultOverlay = document.querySelector(".result-overlay");
    const hintText = document.createElement("div");
    hintText.classList.add("scroll-hint");
    hintText.innerText = "⬆️ スクロールできます ⬇️";
    resultOverlay.parentNode.insertBefore(hintText, resultOverlay);

    function checkScroll() {
        if (resultOverlay.scrollHeight > resultOverlay.clientHeight) {
            hintText.style.display = "block";
        } else {
            hintText.style.display = "none";
        }
    }

    checkScroll();
    new MutationObserver(checkScroll).observe(resultOverlay, { childList: true, subtree: true });
});

let deferredPrompt;

// 🎯 PWA インストールを促す処理
window.addEventListener("beforeinstallprompt", event => {
    event.preventDefault();
    deferredPrompt = event;
    document.getElementById("notify-button").style.display = "block";
});

document.getElementById("notify-button").addEventListener("click", () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(choiceResult => {
            if (choiceResult.outcome === "accepted") {
                console.log("✅ PWA がインストールされました");
            } else {
                console.log("❌ PWA のインストールがキャンセルされました");
            }
            deferredPrompt = null;
            document.getElementById("notify-button").style.display = "none";
        });
    }
});

// 🎯 PWA インストール済みの場合、通知を非表示
window.addEventListener("appinstalled", () => {
    console.log("✅ PWA がインストールされました");
    document.getElementById("notify-button").style.display = "none";
});

// 🎯 プッシュ通知の許可リクエスト
function requestNotificationPermission() {
    if ("Notification" in window && navigator.serviceWorker) {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                navigator.serviceWorker.ready.then(registration => {
                    registration.showNotification("📲 PWA インストールのお知らせ", {
                        body: "ガチャメーカーをインストールしてアプリで楽しもう！",
                        icon: "icons/icon-192x192.png"
                    });
                });
            }
        });
    }
}

// 🎯 Service Worker の登録
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js")
    .then(() => console.log("✅ Service Worker が登録されました"))
    .catch(error => console.error("❌ Service Worker の登録に失敗しました:", error));
}