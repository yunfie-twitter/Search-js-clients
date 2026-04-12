import { createServer } from 'http';
import { WebSocketServer } from 'ws';

// HTTPサーバーを作成
const server = createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Wholphin Sync Server is running. \nWebSocketプロトコルを使用して接続してください (ws:// or wss://)');
});

const wss = new WebSocketServer({ server });
const rooms = new Map(); // roomId -> Set of clients

console.log('Wholphin Sync Server started on port 8000');

wss.on('connection', (ws, req) => {
  let currentRoom = null;
  const ip = req.socket.remoteAddress;
  console.log(`New connection from ${ip}`);

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      
      if (message.type === 'join') {
        const roomId = message.roomId;
        if (!rooms.has(roomId)) {
          rooms.set(roomId, new Set());
        }
        rooms.get(roomId).add(ws);
        currentRoom = roomId;
        console.log(`Client joined room: ${roomId}`);
        ws.send(JSON.stringify({ type: 'joined', roomId }));
        return;
      }

      if (currentRoom && rooms.has(currentRoom)) {
        const clients = rooms.get(currentRoom);
        const broadcastData = JSON.stringify(message);
        
        clients.forEach((client) => {
          if (client !== ws && client.readyState === 1) {
            client.send(broadcastData);
          }
        });
      }
    } catch (e) {
      console.error('Failed to parse message', e);
    }
  });

  ws.on('close', () => {
    if (currentRoom && rooms.has(currentRoom)) {
      rooms.get(currentRoom).delete(ws);
      if (rooms.get(currentRoom).size === 0) {
        rooms.delete(currentRoom);
      }
      console.log(`Client left room: ${currentRoom}`);
    }
  });

  ws.on('error', (err) => {
    console.error('WebSocket client error', err);
  });
});

server.listen(8000, () => {
  console.log('Server is listening on http://localhost:8000');
});
