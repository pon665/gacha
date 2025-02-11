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
});
    let history = JSON.parse(localStorage.getItem("history")) || [];

    // 集計用のオブジェクト
    let aggregate = {};

    // history にある全リスナーの results を合算
    history.forEach(h => {
      for (const [itemName, count] of Object.entries(h.results)) {
        aggregate[itemName] = (aggregate[itemName] || 0) + count;
      }
    });

    // 表示用にテーブルを更新
    const summaryTableBody = document.querySelector("#summary-table tbody");
    summaryTableBody.innerHTML = "";

    let totalCount = 0;
    for (const [itemName, count] of Object.entries(aggregate)) {
      totalCount += count;
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${itemName}</td>
        <td>${count}</td>
      `;
      summaryTableBody.appendChild(row);
    }

    document.getElementById("summary-total").textContent = `合計出現数: ${totalCount}`;
