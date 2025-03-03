// 🎯 画面サイズに応じてレイアウトを調整
function adjustLayout() {
    const width = window.innerWidth;
    const container = document.querySelector(".container");
    const gachaMachine = document.querySelector(".gacha-machine img");
    const resultPanel = document.getElementById("gacha-result-panel");

    if (!container || !gachaMachine || !resultPanel) return;

    container.style.margin = "0 auto";
    container.style.textAlign = "center";
    resultPanel.style.margin = "0 auto";

    if (width <= 480) {
        container.style.width = "95%";
        gachaMachine.style.width = "100%";
        resultPanel.style.width = "90%";
    } else if (width <= 1024) {
        container.style.width = "85%";
        gachaMachine.style.width = "80%";
        resultPanel.style.width = "80%";
    } else {
        container.style.width = "60%";
        gachaMachine.style.width = "60%";
        resultPanel.style.width = "50%";
    }
}

// 🎯 ガチャ履歴の更新（最新の履歴を上に）
function updateHistory() {
    const historyContainer = document.getElementById("history-list");
    if (!historyContainer) {
        console.error("履歴リストの要素が見つかりません。");
        return;
    }
    historyContainer.innerHTML = "";

    let history = JSON.parse(localStorage.getItem("history")) || [];

    if (history.length === 0) {
        historyContainer.innerHTML = `<p>📜 ガチャ履歴はありません。</p>`;
        return;
    }

    // 🎯 リスナーごとに結果を集約
    let aggregatedHistory = {};
    history.forEach(h => {
        if (!aggregatedHistory[h.player]) {
            aggregatedHistory[h.player] = {
                player: h.player,
                count: h.count,
                results: {}
            };
        } else {
            aggregatedHistory[h.player].count += h.count;
        }

        // 🎯 景品のカウントを加算
        Object.entries(h.results).forEach(([item, count]) => {
            if (!aggregatedHistory[h.player].results[item]) {
                aggregatedHistory[h.player].results[item] = 0;
            }
            aggregatedHistory[h.player].results[item] += count;
        });
    });

    // 🎯 オブジェクトから配列に変換
    let aggregatedArray = Object.values(aggregatedHistory);

    // 🎯 並び替えの適用
    let sortType = localStorage.getItem("sortType") || "newest";
    if (sortType === "newest") {
        aggregatedArray.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0)); // 🎯 最新順
    } else {
        aggregatedArray.sort((a, b) => a.player.localeCompare(b.player, "ja")); // 名前順
    }

    // 🎯 履歴を表示
    aggregatedArray.forEach(h => {
        const historyTile = document.createElement("div");
        historyTile.classList.add("history-tile");

        const listenerName = document.createElement("div");
        listenerName.classList.add("history-header");
        listenerName.textContent = `🔔 ${h.player} (合計: ${h.count}回)`;
        historyTile.appendChild(listenerName);

        const itemList = document.createElement("div");
        itemList.classList.add("history-item-list");

        Object.entries(h.results).forEach(([item, count]) => {
            const itemDiv = document.createElement("div");
            itemDiv.classList.add("history-item");
            itemDiv.textContent = `${item} ×${count}`;
            itemList.appendChild(itemDiv);
        });

        historyTile.appendChild(itemList);
        historyContainer.appendChild(historyTile);
    });

    console.log("📌 ガチャ履歴を統合して更新しました。");
}
// 🎯 並び替え機能のセットアップ
function initSortButtons() {
    const sortNewestButton = document.getElementById("sort-newest");
    const sortNameButton = document.getElementById("sort-name");

    if (!sortNewestButton || !sortNameButton) {
        console.warn("ソートボタンが見つかりません。");
        return;
    }

    // 🎯 初回適用（ボタンの色変更）
    let sortType = localStorage.getItem("sortType") || "newest";
    updateSortButtonState(sortType);

    sortNewestButton.addEventListener("click", function () {
        console.log("🆕 新しい順が選択されました");
        localStorage.setItem("sortType", "newest");
        updateSortButtonState("newest");
        updateHistory();
    });

    sortNameButton.addEventListener("click", function () {
        console.log("🔤 名前順が選択されました");
        localStorage.setItem("sortType", "name");
        updateSortButtonState("name");
        updateHistory();
    });
}

// 🎯 選択中の並び順ボタンをハイライト
function updateSortButtonState(type) {
    const sortNewestButton = document.getElementById("sort-newest");
    const sortNameButton = document.getElementById("sort-name");

    if (!sortNewestButton || !sortNameButton) return;

    sortNewestButton.classList.toggle("active", type === "newest");
    sortNameButton.classList.toggle("active", type === "name");
}

// 🎯 各種イベントリスナーをセット
function initEventListeners() {
    // 🎯 ハンバーガーメニュー
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

    // 🎯 履歴クリア
    const clearHistoryButton = document.getElementById("clear-history-button");
    if (clearHistoryButton) {
        clearHistoryButton.addEventListener("click", function () {
            if (confirm("📢 履歴をすべて削除しますか？")) {
                localStorage.removeItem("history");
                updateHistory();
                alert("✅ ガチャ履歴を削除しました！");
            }
        });
    }

    // 🎯 スクリーンショット機能
    const screenshotButton = document.getElementById("screenshot-button");
    if (screenshotButton) {
        screenshotButton.addEventListener("click", function () {
            const historyList = document.getElementById("history-list");
            if (!historyList) {
                alert("📌 ガチャ履歴が見つかりません。");
                return;
            }

            html2canvas(historyList, {
                scale: 2,
                useCORS: true,
                allowTaint: true
            }).then(canvas => {
                const now = new Date();
                const timestamp = now.toISOString().replace(/[-:.]/g, "");
                const playerName = prompt("保存するファイル名を入力してください（入力無しも可）") || "gacha_history";
                const fileName = `${playerName}_${timestamp}.png`;

                let link = document.createElement("a");
                link.href = canvas.toDataURL("image/png");
                link.download = fileName;
                link.click();
            }).catch(error => {
                console.error("スクリーンショットの保存に失敗しました:", error);
                alert("❌ スクリーンショットの保存に失敗しました。");
            });
        });
    }

    // 🎯 履歴ページを開くたびに更新
    window.addEventListener("focus", updateHistory);
}

// 🎯 初回ロード時の処理
document.addEventListener("DOMContentLoaded", function () {
    adjustLayout();
    updateHistory();
    initSortButtons();
    initEventListeners();
});

window.addEventListener("resize", adjustLayout);