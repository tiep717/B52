const WebSocket = require('ws');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 5050;

// =================================================================
// === Cấu hình cho B52 (đã cập nhật URL) ===
// =================================================================
const B52_WEBSOCKET_URL = "wss://cardbodergs.weskb5gams.net/websocket"; 

// Sử dụng tin nhắn xác thực bạn đã cung cấp
const B52_AUTH_MESSAGE = [
  1,
  "MiniGame",
  {
    "agentId": "1",
    "accessToken": "13-e2bd9e1c976d3e263f88f6002da43b20",
    "reconnect": false
  }
];

let historyResults = []; 

function connectWebSocket() {
    console.log("Đang kết nối đến B52 (card server)...");
    const ws = new WebSocket(B52_WEBSOCKET_URL, {
        headers: {
            "User-Agent": "Mozilla/5.0",
            "Origin": "https://i.b52.club"
        }
    });

    ws.on('open', () => {
        console.log("[✅] Đã kết nối WebSocket đến B52!");
        // Gửi tin nhắn xác thực
        ws.send(JSON.stringify(B52_AUTH_MESSAGE));
        console.log("Đã gửi tin nhắn xác thực.");
    });

    ws.on('message', (message) => {
        const rawMessage = message.toString();
        console.log("Nhận được từ B52:", rawMessage);
    });

    ws.on('close', () => {
        console.log(`[🔌] Mất kết nối. Sẽ kết nối lại sau 1 giây.`);
        setTimeout(connectWebSocket, 1000);
    });

    ws.on('error', (err) => {
        console.error("[⚠️] Lỗi WebSocket:", err.message);
    });
}

// === API ===
app.get('/data', (req, res) => {
    res.json(historyResults);
});
app.listen(PORT, () => {
    console.log(`[🌐] Server đang chạy tại http://localhost:${PORT}`);
    connectWebSocket();
});
