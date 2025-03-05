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


function pullGacha() {
    const gachaButton = document.querySelector("button[onclick='pullGacha()']");
    if (!gachaButton) return;

    // 🎯 ガチャボタンをすぐに無効化して連打防止
    gachaButton.disabled = true;

    const playerName = document.getElementById("player-name").value.trim();
    const count = parseInt(document.getElementById("gacha-count").value, 10);

    if (!playerName) {
        alert("リスナー名を入力してください");
        gachaButton.disabled = false; // 🎯 失敗時は再び有効化
        return;
    }

    let items = JSON.parse(localStorage.getItem("items")) || [];
    if (items.length === 0) {
        alert("景品リストがありません。景品を追加してください。");
        gachaButton.disabled = false; // 🎯 失敗時は再び有効化
        return;
    }

    let totalRate = items.reduce((sum, item) => sum + (parseFloat(item.rate) || 0), 0).toFixed(2);
    if (totalRate < 100) {
        alert(`⚠️ 現在の合計確率は ${totalRate}% です。\n\nガチャを回すには確率の合計を 100% にしてください。`);
        gachaButton.disabled = false; // 🎯 失敗時は再び有効化
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
      // 🎯 ガチャ結果を履歴に保存
saveHistory(playerName, count, results);
        stopGachaAnimation();
        playSound("result");
        showResultPanel(results, playerName);
    }, 4800);
}

// 🎯 履歴を保存（既存の履歴と統合する）
function saveHistory(playerName, count, results) {
    let history = JSON.parse(localStorage.getItem("history")) || [];

    // 🎯 既存のリスナーが履歴にある場合は統合
    let existingEntry = history.find(entry => entry.player === playerName);
    if (existingEntry) {
        existingEntry.count += count;
        Object.entries(results).forEach(([item, quantity]) => {
            existingEntry.results[item] = (existingEntry.results[item] || 0) + quantity;
        });
    } else {
        history.unshift({ player: playerName, count, results, timestamp: new Date().toISOString() });
    }

    localStorage.setItem("history", JSON.stringify(history));
}

document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ ページ読み込み完了");
    updateItemList();
    initSortButtons();
});

// 🎯 結果パネルの表示
function showResultPanel(results, playerName, imageSrc) {
    console.log("🎰 ガチャ結果パネルを表示");
    
    const resultPanel = document.getElementById("gacha-result-panel");
    const playerNameDisplay = document.getElementById("player-name-display");
    const resultListContainer = document.getElementById("result-list");
    const resultImage = document.getElementById("result-image");

    if (!resultPanel || !playerNameDisplay || !resultListContainer || !resultImage) {
        console.error("❌ 必要な要素が見つかりません");
        return;
    }

    resultPanel.style.display = "block";
    document.body.classList.add("modal-open"); // 🎯 背景スクロール無効化

    // 🎯 プレイヤー名を表示
    playerNameDisplay.innerText = `🎉 ${playerName} さんのガチャ結果 🎉`;

    // 🎯 景品リストのクリア
    resultListContainer.innerHTML = "";

    // 🎯 結果をログ出力（デバッグ用）
    console.log("📝 受け取ったガチャ結果:", results);

    // 🎯 景品リストを五十音順にソート
    const sortedResults = Object.entries(results).sort(([a], [b]) => a.localeCompare(b, "ja"));

    // 🎯 2列表示で景品を追加
    sortedResults.forEach(([item, count]) => {
        const itemDiv = document.createElement("div");
        itemDiv.classList.add("result-item");
        itemDiv.innerHTML = `${item} × ${count}`;

        // 🎯 確率が小数点以下の景品にエフェクトを追加
        if (count < 1) {
            itemDiv.classList.add("rare-item");
            itemDiv.innerHTML += " ✨";
        }

        resultListContainer.appendChild(itemDiv);
    });

    // 🎯 画像の表示
    if (imageSrc) {
        resultImage.src = imageSrc;
        resultImage.style.display = "block";
    } else {
        resultImage.style.display = "none";
    }

    // 🎯 スクロール制御（景品が多い時のみスクロール）
    setTimeout(() => {
        if (resultListContainer.scrollHeight > resultListContainer.clientHeight) {
            resultListContainer.style.overflowY = "auto";
        } else {
            resultListContainer.style.overflowY = "hidden";
        }
    }, 100);

    console.log("✅ ガチャ結果パネルの更新完了");
}

// 🎯 結果パネルを閉じた時にガチャボタンを再び有効化
function closeResultPanel() {
    console.log("🔄 結果パネルを閉じる");
    const resultPanel = document.getElementById("gacha-result-panel");

    if (resultPanel) {
        resultPanel.style.display = "none";
    }

    document.body.classList.remove("modal-open"); // 🎯 スクロール解除
    resetGachaInputs(); // 🎯 入力リセット

    // 🎯 ガチャボタンを再有効化
    const gachaButton = document.querySelector("button[onclick='pullGacha()']");
    if (gachaButton) {
        gachaButton.disabled = false;
        console.log("✅ ガチャボタンが再び押せるようになりました");
    }
}

// 🎯 X（Twitter）へ投稿
function postToX() {
    const playerNameElement = document.getElementById("player-name-display");
    const resultList = document.getElementById("result-list");

    if (!playerNameElement || !resultList) {
        alert("⚠️ リスナー名またはガチャ結果が取得できません。");
        return;
    }

    const playerName = playerNameElement.innerText.replace("🎉 ", "").replace(" さんのガチャ結果 🎉", "").trim();
    const results = Array.from(resultList.children)
        .map(item => item.innerText)
        .join("\n");

    if (!playerName || !results) {
        alert("⚠️ ガチャ結果がありません。ガチャを引いてください。");
        return;
    }

    const tweetText = encodeURIComponent(`🎉 ${playerName} さんのガチャ結果 🎉\n${results}`);
    const tweetUrl = `https://twitter.com/intent/tweet?text=${tweetText}`;

    window.open(tweetUrl, "_blank");

    // 🎯 X（Twitter）投稿後のリセット対応
    setTimeout(() => {
        resetGachaInputs();
    }, 500);
}

// 🎯 ページがアクティブになったときにリセット
window.addEventListener("focus", function () {
    console.log("🔄 X（Twitter）投稿後にページがアクティブになったため、ガチャ入力をリセット");
    resetGachaInputs();
});

// 🎯 ガチャのリスナー名と回数をリセットする関数
function resetGachaInputs() {
    const playerNameInput = document.getElementById("player-name");
    const gachaCountInput = document.getElementById("gacha-count");

    if (playerNameInput) {
        playerNameInput.value = "";
        console.log("📝 リスナー名リセット");
    }
    if (gachaCountInput) {
        gachaCountInput.value = 1;
        console.log("📝 ガチャ回数リセット（1回に戻す）");
    }
}

// 🎯 閉じるボタンの処理を修正（閉じる際にガチャボタンを有効化）
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

    if (!name || isNaN(rate) || rate <= 0 || rate > 100) {
        alert("⚠️ 正しい確率を入力してください。（1%～100%）");
        return;
    }

    let items = JSON.parse(localStorage.getItem("items")) || [];

    // 🎯 追加前の合計確率を計算
    let currentTotalRate = items.reduce((sum, item) => sum + parseFloat(item.rate || 0), 0);
    
    // 🎯 追加後の合計確率
    let newTotalRate = currentTotalRate + rate;

    // 🎯 100%を超える場合は追加せずにアラートを出す
    if (newTotalRate > 100) {
        alert(`⚠️ 現在の確率は ${currentTotalRate.toFixed(2)}% です。\n追加すると ${newTotalRate.toFixed(2)}% になり、100%を超えます。\n景品を追加できません。`);
        return; // 追加をキャンセル
    }

    // 🎯 景品を追加
    items.push({ name, rate });
    localStorage.setItem("items", JSON.stringify(items));

    // 🎯 入力欄をリセット
    document.getElementById("item-name").value = "";
    document.getElementById("item-rate").value = "";

    // 🎯 景品リストを更新
    updateItemList();
}

function updateItemList() {
    const itemList = document.getElementById("item-list");
    const totalRateDisplay = document.getElementById("total-rate-display");
    const totalItemsDisplay = document.getElementById("total-items-display");

    if (!itemList || !totalRateDisplay || !totalItemsDisplay) {
        console.error("❌ 必要な要素が見つかりません。");
        return;
    }

    let items = JSON.parse(localStorage.getItem("items")) || [];

    // 🎯 五十音順にソート
    items.sort((a, b) => a.name.localeCompare(b.name, "ja"));

    // 🎯 確率の合計を計算
    let totalRate = items.reduce((sum, item) => sum + item.rate, 0).toFixed(2);

    // 🎯 合計確率の表示
    totalRateDisplay.textContent = `${totalRate} / 100%`;

    // 🎯 確率が100%を超えたら警告
    if (totalRate > 100) {
        totalRateDisplay.style.color = "red"; // ⚠️ 100%超えたら赤字
        alert(`⚠️ 現在の確率は ${totalRate}% です。ガチャを回すには100%以下にしてください。`);
    } else {
        totalRateDisplay.style.color = "black";
    }

    // 🎯 景品数を表示
    totalItemsDisplay.textContent = `景品の数: ${items.length} 個`;

    // 🎯 景品リストを表示
    itemList.innerHTML = ""; // リストをクリア

    items.forEach((item, index) => {
        const div = document.createElement("div");
        div.className = "item-row";
        div.innerHTML = `
            <span>${item.name}</span>
            <span>確率: ${item.rate}%</span>
            <button class="delete-button" onclick="deleteItem('${item.name}')">削除</button>
        `;
        itemList.appendChild(div);
    });

    console.log("✅ 景品リストを更新しました！");
}

// 🎯 削除時に景品名で削除する
function deleteItem(name) {
    let items = JSON.parse(localStorage.getItem("items")) || [];

    // 🎯 景品名で対象を検索
    let updatedItems = items.filter(item => item.name !== name);

    if (items.length === updatedItems.length) {
        alert("❌ 削除対象が見つかりません。");
        return;
    }

    if (!confirm(`${name} を削除しますか？`)) return;

    localStorage.setItem("items", JSON.stringify(updatedItems));
    updateItemList();
}

function deleteItem(itemName) {
    let items = JSON.parse(localStorage.getItem("items")) || [];

    // 🎯 削除対象の特定
    const updatedItems = items.filter(item => item.name !== itemName);

    if (items.length === updatedItems.length) {
        alert("❌ 削除対象が見つかりません。");
        return;
    }

    if (!confirm(`❌ ${itemName} を削除しますか？`)) return;

    // 🎯 更新したリストを保存
    localStorage.setItem("items", JSON.stringify(updatedItems));

    // 🎯 景品リストを再描画
    updateItemList();
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
    setTimeout(() => {
        const resultOverlay = document.querySelector(".result-overlay");

        if (!resultOverlay) {
            console.warn("⚠️ .result-overlay の要素が見つかりません。");
            return;
        }

        // 既にスクロールヒントがある場合は追加しない
        if (!document.querySelector(".scroll-hint")) {
            const hintText = document.createElement("div");
            hintText.classList.add("scroll-hint");
            hintText.innerText = "⬆️ スクロールできます ⬇️";

            // `.result-overlay` の直前にヒントを追加
            resultOverlay.parentNode.insertBefore(hintText, resultOverlay);
        }

        function checkScroll() {
            const hint = document.querySelector(".scroll-hint");
            if (!hint) return;

            if (resultOverlay.scrollHeight > resultOverlay.clientHeight) {
                resultOverlay.style.overflowY = "auto"; // スクロール可能に
                hint.style.display = "block";
            } else {
                resultOverlay.style.overflowY = "hidden"; // スクロール不要
                hint.style.display = "none";
            }
        }

        // 初回チェック
        checkScroll();

        // 動的に変更があった場合も監視
        new MutationObserver(checkScroll).observe(resultOverlay, { childList: true, subtree: true });

        // ** 結果パネルを閉じたらスクロールをリセット **
        document.getElementById("close-button").addEventListener("click", function () {
            resultOverlay.scrollTop = 0; // スクロール位置をリセット
            document.querySelector(".scroll-hint").style.display = "none";
        });
    }, 500); // 500ms 待機して実行
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

