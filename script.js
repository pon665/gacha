function adjustLayout() {
    const width = window.innerWidth;
    const container = document.querySelector(".container");
    const gachaMachine = document.querySelector(".gacha-machine img");
    const resultPanel = document.getElementById("gacha-result-panel");

    if (!container || !gachaMachine || !resultPanel) return;

    // 共通のスタイル設定（中央寄せ）
    container.style.margin = "0 auto";
    container.style.textAlign = "center";
    
    resultPanel.style.margin = "0 auto";

    if (width <= 480) {
        // 🎯 スマホ向け
        container.style.width = "95%";
        gachaMachine.style.width = "100%";
        resultPanel.style.width = "90%";
    } else if (width <= 1024) {
        // 🎯 タブレット向け
        container.style.width = "85%";
        gachaMachine.style.width = "80%";
        resultPanel.style.width = "80%";
    } else {
        // 🎯 PC向け
        container.style.width = "60%";
        gachaMachine.style.width = "60%";
        resultPanel.style.width = "50%";
    }
}

// 🎯 初回ロード時 & 画面サイズ変更時にレイアウトを調整
window.addEventListener("DOMContentLoaded", adjustLayout);
window.addEventListener("resize", adjustLayout);

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



// 🎯 画像プリロード（キャッシュ対策）
const preloadImages = ["image1.png", "image2.png", "image3.png", "image4.png", "image5.png", "images.png"];
preloadImages.forEach(src => {
    const img = new Image();
    img.src = src;
});

// 🎯 ガチャマシンのアニメーション（最適化）
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
            gachaImage.src = images[index] + "?v=" + new Date().getTime(); // キャッシュバイパス
            gachaImage.style.opacity = 1;
        }, 100);
        index = (index + 1) % images.length;
    }, 400);
}

function stopGachaAnimation() {
    clearInterval(window.animationInterval);
    document.getElementById("gacha-frame").src = "image1.png";
}

// 🎯 結果パネルの表示（画像プリロード & 遅延なし）
function showResultPanel(results, playerName) {
    const resultPanel = document.getElementById("gacha-result-panel");
    const resultText = document.getElementById("result-text");
    const resultImage = document.getElementById("result-image");
    const playerNameDisplay = document.getElementById("player-name-display");

    resultPanel.style.display = "block";
    resultText.innerHTML = "";

    Object.entries(results).forEach(([item, num]) => {
        const listItem = document.createElement("p");
        listItem.innerText = `${item} × ${num}`;
        resultText.appendChild(listItem);
    });

    playerNameDisplay.innerText = `リスナー名: ${playerName}`;

    // 🎯 画像をプリロードしてから表示
    const img = new Image();
    img.src = "images.png";
    img.onload = () => {
        resultImage.src = img.src;
    };
}

// 🎯 ガチャを引く
function pullGacha() {
    const gachaButton = document.querySelector("button[onclick='pullGacha()']");
    if (!gachaButton) return;

    gachaButton.disabled = true;
    const playerName = document.getElementById("player-name").value.trim();
    const count = parseInt(document.getElementById("gacha-count").value, 10);

    if (!playerName) {
        alert("リスナー名を入力してください");
        gachaButton.disabled = false;
        return;
    }

    let items = JSON.parse(localStorage.getItem("items")) || [];
    if (items.length === 0) {
        alert("景品リストがありません。景品を追加してください。");
        gachaButton.disabled = false;
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
        showResultPanel(results, playerName);
    }, 4800);
}
// 🎯 結果パネルを閉じる（ガチャボタンを有効化＆リスナー名をクリア）
function closeResultPanel() {
    document.getElementById("gacha-result-panel").style.display = "none";

    // 🎯 ガチャボタンを再度有効化
    const gachaButton = document.querySelector("button[onclick='pullGacha()']");
    if (gachaButton) {
        gachaButton.disabled = false;
    }

    // 🎯 リスナー名をクリア
    document.getElementById("player-name").value = "";
}

// 🎯 閉じるボタンの処理を修正（閉じる際にボタンを有効化＆リスナー名をクリア）
document.addEventListener("DOMContentLoaded", function () {
    const closeButton = document.getElementById("close-button");
    if (closeButton) {
        closeButton.addEventListener("click", function () {
            closeResultPanel();
        });
    }
});
// 🎯 閉じるボタンの処理を修正（閉じる際にボタンを有効化）
document.addEventListener("DOMContentLoaded", function () {
    const closeButton = document.getElementById("close-button");
    if (closeButton) {
        closeButton.addEventListener("click", function () {
            closeResultPanel();
        });
    }
});

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

// 🎯 Service Worker の登録
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js")
        .then((registration) => {
            console.log("✅ Service Worker Registered:", registration);
        })
        .catch((error) => {
            console.error("❌ Service Worker Registration Failed:", error);
        });
}

// 🎯 インストールを促すプッシュ通知
let deferredPrompt;

window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event;

    // 3秒後にインストールの案内を表示
    setTimeout(() => {
        showInstallNotification();
    }, 3000);
});

function showInstallNotification() {
    if (Notification.permission === "granted") {
        new Notification("ガチャメーカー", {
            body: "アプリをインストールすると、すぐにガチャを回せるようになります！",
            icon: "icon-192.png"
        }).onclick = () => {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === "accepted") {
                    console.log("✅ PWA Installed");
                }
            });
        };
    } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then((permission) => {
            if (permission === "granted") {
                showInstallNotification();
            }
        });
    }
}

// 🎯 手動でプッシュ通知を送る
function sendPushNotification() {
    if ("serviceWorker" in navigator && "PushManager" in window) {
        navigator.serviceWorker.ready.then((registration) => {
            registration.showNotification("ガチャメーカー", {
                body: "アプリをインストールすると、すぐにガチャを回せるようになります！",
                icon: "icon-192.png",
                vibrate: [200, 100, 200],
                actions: [
                    { action: "install", title: "インストールする" }
                ]
            });
        });
    }
}

// 10秒後にインストールを促すプッシュ通知を送信
setTimeout(sendPushNotification, 10000);