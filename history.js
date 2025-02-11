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
        const historyTableBody = document.querySelector("#history-list tbody");
        historyTableBody.innerHTML = "";

        let history = JSON.parse(localStorage.getItem("history")) || [];

        history.forEach(h => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${h.player}</td>
                <td>${Object.entries(h.results).map(([item, count]) => `${item} ×${count}`).join(", ")}</td>
                <td>${h.count}</td>
            `;
            historyTableBody.appendChild(row);
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
});