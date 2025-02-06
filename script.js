let isMuted = false; // ミュート状態を保持
let volume = 1.0; // 音量（0.0～1.0）

function toggleMute() {
  isMuted = !isMuted; // ミュート状態を切り替え
  const muteButton = document.getElementById("mute-button");
  const muteStatus = document.getElementById("mute-status");

  // ボタンのテキストを変更
  muteButton.innerText = isMuted ? "ミュート解除" : "ミュート";

  // インジケーターの状態を更新
  muteStatus.innerText = isMuted ? "音なし" : "音あり";
  muteStatus.classList.toggle("muted", isMuted);

  // ウィンドウアラートでお知らせ
  if (isMuted) {
    alert("ミュート中です。音が再生されません。");
  } else {
    alert("ミュートが解除されました。音が再生されます。");
  }
}
// サウンド再生関数
function playSound(type) {
  if (isMuted) return; // ミュート中は再生しない

  let audio;
  switch (type) {
    case "start":
      audio = new Audio("sounds/gacha_start.mp3"); // ガチャ開始音
      break;
    case "result":
      audio = new Audio("sounds/result.mp3"); // ガチャ結果音
      break;
    default:
      return;
  }

  audio.volume = volume; // 音量設定
  audio.play().catch((e) => console.error("サウンド再生エラー:", e));
}

let items = JSON.parse(localStorage.getItem("items")) || []; // 景品リストの初期化
let history = JSON.parse(localStorage.getItem("history")) || []; // ガチャ履歴の初期化

document.addEventListener("DOMContentLoaded", () => {
  updateItemList();
  updateHistory();
});

// 景品を追加
function addItem() {
  const name = document.getElementById("item-name").value.trim();
  const rate = parseFloat(document.getElementById("item-rate").value);

  if (name && rate > 0 && rate <= 100) {
    items.push({ name, rate });
    localStorage.setItem("items", JSON.stringify(items)); // ローカルストレージに保存
    document.getElementById("item-name").value = "";
    document.getElementById("item-rate").value = "";
    updateItemList();
  } else {
    alert("正しい値を入力してください");
  }
}

// 景品を削除
function deleteItem(index) {
  if (confirm("この景品を削除しますか？")) {
    items.splice(index, 1);
    localStorage.setItem("items", JSON.stringify(items)); // ローカルストレージを更新
    updateItemList();
  }
}

// 景品リストを更新
function updateItemList() {
  const itemList = document.getElementById("item-list");
  itemList.innerHTML = "";
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

// ガチャを引く
function pullGacha() {
    const playerName = document.getElementById("player-name").value.trim();
    const count = parseInt(document.getElementById("gacha-count").value, 10);
    const gachaImage = document.getElementById("gacha-frame"); // カプセル画像
    const resultImage = document.getElementById("result-image"); // 結果画像
    const resultText = document.getElementById("result-text"); // 結果テキスト
    const resultPanel = document.getElementById("gacha-result-panel"); // 結果パネル
    const playerNameDisplay = document.getElementById("player-name-display"); // プレイヤー名表示

    if (!playerName) {
        alert("リスナー名を入力してください");
        return;
    }

    if (items.length === 0) {
        alert("景品リストがありません。景品を追加してください。");
        return;
    }

    // 確率の合計をチェック
    const totalRate = items.reduce((sum, item) => sum + item.rate, 0);
    if (totalRate !== 100) {
        alert(`景品の確率合計が100%ではありません（現在: ${totalRate.toFixed(2)}％）。正しく設定してください。`);
        return;
    }

    // ガチャ開始音
    playSound("start");

    // 🔹 カプセルのアニメーション開始
    let index = 0;
    const images = ["image2.png", "image3.png","image4.png","image5.png"];
if (window.animationInterval) {
        clearInterval(window.animationInterval); // 既存のアニメーションをリセット
    }
      
  window.animationInterval = setInterval(() => {
        gachaImage.style.opacity = 0;
        setTimeout(() => {
            gachaImage.src = images[index];
            gachaImage.style.opacity = 1;
        }, 100); // フェードインの時間を短縮（目に優しい）

        index = (index + 1) % images.length;

        // 🎯 徐々に切り替え速度を調整（最初は速く → 徐々に遅く）
        if (switchSpeed < 400) {
            switchSpeed += 20; // 速度を少しずつ遅くする
           

    // ⏳ 5秒後にガチャ結果を表示
    setTimeout(() => {
        clearInterval(window.animationInterval); // 🎯 アニメーションを停止
        window.animationInterval = null;

        // ガチャ結果を取得
        const results = {};
        let selectedItem = null;
        for (let i = 0; i < count; i++) {
            const random = Math.random() * 100;
            let cumulativeRate = 0;
            for (const item of items) {
                cumulativeRate += item.rate;
                if (random <= cumulativeRate) {
                    results[item.name] = (results[item.name] || 0) + 1;
                    selectedItem = item.name;
                    break;
                }
            }
        }

        // 🎉 追加の画像とテキストを表示
        if (selectedItem) {
            resultImage.src = `images.png`;
            resultText.innerText = selectedItem;
            playerNameDisplay.innerText = `リスナー名: ${playerName}`;
            resultPanel.style.display = "block";
        }

        // カプセルを最後の状態に固定
        gachaImage.src = "image1.png";

        // 🎯 履歴を保存
        const existingHistory = history.find(h => h.player === playerName);
        if (existingHistory) {
            existingHistory.count += count;
            for (const [itemName, c] of Object.entries(results)) {
                existingHistory.results[itemName] = (existingHistory.results[itemName] || 0) + c;
            }
        } else {
            history.push({
                player: playerName,
                count: count,
                results: results
            });
        }

        // 🎯 ローカルストレージに履歴を保存
        localStorage.setItem("history", JSON.stringify(history));

        // 🎯 履歴を更新（表示用）
        updateHistory();

        // ガチャ結果音を再生
        playSound("result");
    }, 4900);
}function closeResultPanel() {
    document.getElementById("gacha-result-panel").style.display = "none";
}
function closeResultPanel() {
    document.getElementById("gacha-result-panel").style.display = "none";

    // 🎯 カプセルの画像を最初の状態に戻す
    const gachaImage = document.getElementById("gacha-frame");
    gachaImage.src = "image1.png"; // 最初の画像に戻す
}
// ガチャ履歴を表に更新
function updateHistory() {
    const historyTableBody = document.querySelector("#history-list tbody");
    historyTableBody.innerHTML = "";

    history.forEach(h => {
        const resultsText = Object.entries(h.results)
            .map(([item, count]) => `${item} × ${count}`)
            .join(", ");

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${h.player}</td>
            <td>${resultsText}</td>
            <td>${h.count}</td>
        `;
        historyTableBody.appendChild(row);
    });
}
// 履歴をクリア
function clearHistory() {
  if (confirm("履歴をクリアしますか？")) {
    history = [];
    localStorage.removeItem("history"); // ローカルストレージから削除
    updateHistory();
  }
}

// X（Twitter）に投稿
function postToX() {
    const resultText = document.getElementById("result-text").innerText;
    const playerName = document.getElementById("player-name-display").innerText.replace("リスナー名: ", ""); // 🎯 プレイヤー名取得
    const resultImage = document.getElementById("result-image").src;

    if (!resultText || !playerName) {
        alert("リスナー名またはガチャ結果がありません。ガチャを引いてください。");
        return;
    }

    // ガチャ結果を取得（テキストをエンコード）
    const tweetText = encodeURIComponent(`リスナー名: ${playerName}\nガチャ結果:\n${resultText}`);

    // X（Twitter）の投稿URL
    let tweetUrl = `https://twitter.com/intent/tweet?text=${tweetText}`;

    // Xの投稿画面を開く
    window.open(tweetUrl, "_blank");
}
