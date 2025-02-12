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

    // 🎯 ガチャ履歴を更新
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

        // 🎯 同じプレイヤー名の履歴を統合
        let mergedHistory = {};

        history.forEach(h => {
            if (!mergedHistory[h.player]) {
                mergedHistory[h.player] = { count: 0, results: {} };
            }
            mergedHistory[h.player].count += h.count;

            // 🎯 景品を合算
            Object.entries(h.results).forEach(([item, count]) => {
                mergedHistory[h.player].results[item] = (mergedHistory[h.player].results[item] || 0) + count;
            });
        });

        // 🎯 履歴をリストとして表示
        Object.entries(mergedHistory).forEach(([player, data]) => {
            const historyTile = document.createElement("div");
            historyTile.classList.add("history-tile");

            // 🎯 リスナー名 + 合計回数
            const listenerName = document.createElement("div");
            listenerName.classList.add("history-header");
            listenerName.textContent = `🔔 ${player} (合計: ${data.count}回)`;
            historyTile.appendChild(listenerName);

            // 🎯 景品リスト（横2列）
            const itemList = document.createElement("div");
            itemList.classList.add("history-item-list");

            Object.entries(data.results).forEach(([item, count]) => {
                const itemDiv = document.createElement("span");
                itemDiv.classList.add("history-item");
                itemDiv.textContent = `${item} ×${count}`;
                itemList.appendChild(itemDiv);
            });

            historyTile.appendChild(itemList);
            historyContainer.appendChild(historyTile);
        });
    }

    updateHistory(); // 初回ロード時に履歴を更新

    // 🎯 履歴をクリア
    const clearHistoryButton = document.getElementById("clear-history-button");
    if (clearHistoryButton) {
        clearHistoryButton.addEventListener("click", function () {
            if (confirm("📢 履歴をすべて削除しますか？")) {
                localStorage.removeItem("history");
                updateHistory();
                alert("✅ ガチャ履歴を削除しました！");
            }
        });
    } else {
        console.error("履歴クリアボタンが見つかりません。");
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
    } else {
        console.error("スクリーンショットボタンが見つかりません。");
    }
});