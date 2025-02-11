document.addEventListener("DOMContentLoaded", function () {
    // 🎯 ハンバーガーメニューの開閉処理
    const menuButton = document.querySelector(".hamburger-menu");
    const menuList = document.querySelector(".menu-list");

    if (menuButton && menuList) {
        menuButton.addEventListener("click", function (event) {
            event.stopPropagation(); // 🔹 クリック時のイベントバブリングを防ぐ
            menuList.classList.toggle("show"); // 🔹 アニメーション付きで表示・非表示を切り替え
        });

        // 🔹 メニュー外をクリックしたら閉じる
        document.addEventListener("click", function (event) {
            if (!menuButton.contains(event.target) && !menuList.contains(event.target)) {
                menuList.classList.remove("show");
            }
        });
    }

    // 🎯 ガチャ履歴を更新
    function updateHistory() {
        const historyContainer = document.getElementById("history-list");
        historyContainer.innerHTML = "";

        let history = JSON.parse(localStorage.getItem("history")) || [];

        history.forEach(h => {
            const historyTile = document.createElement("div");
            historyTile.classList.add("history-tile");

            // 🎯 リスナー名
            const listenerName = document.createElement("div");
            listenerName.classList.add("history-header");
            listenerName.textContent = `🔔 ${h.player}`;
            historyTile.appendChild(listenerName);

            // 🎯 景品リスト（横2列）
            const itemList = document.createElement("div");
            itemList.classList.add("history-item-list");

            Object.entries(h.results).forEach(([item, count]) => {
                const itemDiv = document.createElement("span");
                itemDiv.classList.add("history-item");
                itemDiv.textContent = `${item} ×${count}`;
                itemList.appendChild(itemDiv);
            });

            historyTile.appendChild(itemList);
            historyContainer.appendChild(historyTile);
        });
    }

    // 🎯 履歴をクリア
    function clearHistory() {
        if (confirm("履歴をクリアしますか？")) {
            localStorage.removeItem("history");
            updateHistory();
        }
    }

    updateHistory();

    // 🎯 スクリーンショット機能（確実に動作する修正版）
    document.getElementById("screenshot-button").addEventListener("click", function () {
        html2canvas(document.getElementById("history-list"), {
            scale: 2, // 高解像度
            useCORS: true, // CORSエラー対策
            allowTaint: true,
            logging: false
        }).then(canvas => {
            const now = new Date();
            const timestamp = now.toISOString().replace(/[-:.]/g, ""); // 例: 20240207153000
            const playerName = prompt("保存するファイル名を入力してください（入力無しも可）") || "gacha_history";
            const fileName = `${playerName}_${timestamp}.png`;

            // 画像をダウンロード
            let link = document.createElement("a");
            link.href = canvas.toDataURL("image/png");
            link.download = fileName;
            link.click();
        }).catch(error => {
            console.error("スクリーンショットの保存に失敗しました:", error);
            alert("スクリーンショットの保存に失敗しました。");
        });
    });
});