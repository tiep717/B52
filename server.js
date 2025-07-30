const { io } = require("socket.io-client");
const express = require("express");
const app = express();
const PORT = process.env.PORT || 5050;

// =================================================================
// === Cấu hình ===
// =================================================================
const URL = "wss://ws06.wsmt8g.cc"; 
const AUTH_MESSAGE = [
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
    console.log("Đang kết nối đến server Socket.IO v2...");
    
    // Dùng thư viện socket.io-client để kết nối
    const socket = io(URL, {
        // === PHẦN SỬA LỖI TƯƠNG THÍCH ===
        reconnection: false, // Tắt tự động kết nối lại của thư viện
        transports: ["websocket"],
        // Thêm tùy chọn này để client v4 có thể "nói chuyện" với server v2
        protocolVersion: 5 
    });

    socket.on('connect', () => {
        console.log("[✅] Đã kết nối Socket.IO thành công! SID:", socket.id);
        socket.send(AUTH_MESSAGE);
        console.log("Đã gửi tin nhắn xác thực.");
    });

    socket.onAny((eventName, ...args) => {
        console.log(`Nhận được sự kiện '${eventName}':`, args);
    });
    
    socket.on('disconnect', (reason) => {
        console.log(`[🔌] Mất kết nối: ${reason}. Sẽ kết nối lại sau 3 giây.`);
        socket.close();
        setTimeout(connectWebSocket, 3000);
    });

    socket.on('connect_error', (err) => {
        console.error("[⚠️] Lỗi kết nối:", err.message);
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
