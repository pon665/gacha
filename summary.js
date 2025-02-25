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

    // 🎯 履歴データを取得
    let history = JSON.parse(localStorage.getItem("history")) || [];

 history.forEach(h => {
        h.results = Object.fromEntries(Object.entries(h.results).sort(([a], [b]) => a.localeCompare(b, 'ja')));
    });

    // 🎯 集計用のオブジェクト
    let aggregate = {};

    // 🎯 history にある全リスナーの results を合算
    history.forEach(h => {
        for (const [itemName, count] of Object.entries(h.results)) {
            aggregate[itemName] = (aggregate[itemName] || 0) + count;
        }
    });

    // 🎯 集計テーブルを取得
    const summaryTableBody = document.querySelector("#summary-table tbody");
    const summaryTotal = document.getElementById("summary-total");

    if (!summaryTableBody || !summaryTotal) {
        console.error("集計テーブルまたは合計出現数の要素が見つかりません。");
        return;
    }

    // 🎯 表示用にテーブルを更新
    summaryTableBody.innerHTML = "";

    let totalCount = 0;
    Object.entries(aggregate).forEach(([itemName, count]) => {
        totalCount += count;
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${itemName}</td>
            <td class="item-count">×${count}</td>
        `;
        summaryTableBody.appendChild(row);
    });

    // 🎯 合計出現数を表示
    summaryTotal.textContent = `🎯 合計出現数: ${totalCount}`;
});