const WebSocket = require('ws');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 5050;

// =================================================================
// === Cấu hình cho B52 ===
// =================================================================
const B52_WEBSOCKET_URL = "wss://minybordergs.weskb5gams.net/websocket"; 
const B52_AUTH_MESSAGE = [
  1,
  "Minigame",
  "",
  "",
  {
    "agentId": "1",
    "accessToken": "13-5be670a54d6000d54083eefbc8ecf615",
    "reconnect": true 
  }
];
const messagesToSend = [
    B52_AUTH_MESSAGE,
    [6, "MiniGame", "lobbyPlugin", { "cmd": 10001 }],
    [6, "MiniGame", "taixiuPlugin", { "cmd": 1005 }]
];

let historyResults = []; 

function connectWebSocket() {
    console.log("Đang kết nối đến B52...");
    const ws = new WebSocket(B52_WEBSOCKET_URL, {
        headers: {
            "User-Agent": "Mozilla/5.0",
            "Origin": "https://i.b52.club" 
        }
    });

    ws.on('open', () => {
        console.log("[✅] Đã kết nối WebSocket đến B52!");
        messagesToSend.forEach((msg, i) => {
            setTimeout(() => {
                if(ws.readyState === WebSocket.OPEN) {
                    console.log("Gửi đi:", JSON.stringify(msg));
                    ws.send(JSON.stringify(msg));
                }
            }, i * 500);
        });
    });
    
    ws.on('message', (message) => {
        const rawMessage = message.toString();
        console.log("Nhận được từ B52:", rawMessage);
        
        try {
            const parsedData = JSON.parse(rawMessage);
            const d = parsedData[1]?.d; 

            if (d && d.d1 !== undefined && d.d2 !== undefined && d.d3 !== undefined && d.sid) {
                const { d1, d2, d3, sid } = d;
                const total = d1 + d2 + d3;
                const resultText = total >= 11 ? "Tài" : "Xỉu";
                const ketQuaString = `${d1}-${d2}-${d3} = ${total} (${resultText})`;

                console.log(`[🎲 KẾT QUẢ] Phiên ${sid}: ${ketQuaString}`);

                const newResult = {
                    id_phien: sid,
                    ket_qua: ketQuaString,
                    dices: [d1, d2, d3],
                    total: total,
                    result: resultText,
                    time: new Date().toLocaleTimeString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })
                };

                historyResults.unshift(newResult);
                if (historyResults.length > 50) {
                    historyResults.pop();
                }
            }
        } catch (e) {
            // Bỏ qua nếu tin nhắn không phải là JSON hoặc có cấu trúc khác
        }
    });

    ws.on('close', () => {
        console.log(`[🔌] Mất kết nối. Sẽ kết nối lại sau 1 giây.`);
        setTimeout(connectWebSocket, 1000); // <-- ĐÃ SỬA
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
