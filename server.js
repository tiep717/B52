const WebSocket = require('ws');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 5050;

// =================================================================
// === Thông tin mới đã được điền vào đây ===
// =================================================================
const NEW_WEBSOCKET_URL = "wss://ws06.wsmt8g.cc/socket.io/?token=13-e2bd9e1c976d3e263f88f6002da43b20&sv=v5&env=portal&games=all&ssid=82edcafb46d54d52a5fab04ae8ec447b&EIO=3&transport=websocket"; 
const AUTH_MESSAGE = [
  1,
  "MiniGame",
  {
    "agentId": "1",
    "accessToken": "13-e2bd9e1c976d3e263f88f6002da43b20",
    "reconnect": false
  }
];

// Biến lưu trữ lịch sử
let historyResults = []; 

function connectWebSocket() {
    console.log("Đang kết nối...");
    const ws = new WebSocket(NEW_WEBSOCKET_URL, {
        headers: {
            "User-Agent": "Mozilla/5.0"
        }
    });

    ws.on('open', () => {
        console.log("[✅] Đã kết nối WebSocket!");
        // Gửi tin nhắn xác thực
        ws.send(JSON.stringify(AUTH_MESSAGE));
        console.log("Đã gửi tin nhắn xác thực.");
    });

    ws.on('message', (message) => {
        const rawMessage = message.toString();
        console.log("Nhận được:", rawMessage);
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
