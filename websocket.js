import { WebSocketServer } from "ws";

let wss;

export function initWebSocket(server) {
  wss = new WebSocketServer({ server });

  wss.on("connection", (ws) => {
    console.log("WS: Client connected");
    sendSync(ws);
  });

  console.log("WebSocket server initialized");
}

export function sendSync(ws) {
  ws.send(JSON.stringify({ type: "SYNC" }));
}

export function broadcastSync() {
  if (!wss) return;

  wss.clients.forEach(client => {
    if (client.readyState === 1) {
      client.send(JSON.stringify({ type: "SYNC" }));
    }
  });

  console.log("WS: Broadcasted SYNC event to clients");
}
