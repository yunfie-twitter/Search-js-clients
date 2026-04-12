import { createServer } from 'http';
import { WebSocketServer } from 'ws';

const server = createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Wholphin Sync Server is running.');
});

const wss = new WebSocketServer({ server });
const rooms = new Map(); // roomId -> Set of ws

wss.on('connection', (ws) => {
  let currentRoom = null;
  let currentDeviceId = null;

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      
      if (message.type === 'join') {
        const { roomId, deviceId } = message;
        currentRoom = roomId;
        currentDeviceId = deviceId;

        if (!rooms.has(roomId)) rooms.set(roomId, new Set());
        rooms.get(roomId).add(ws);

        // 新規参加を全員に通知（これを受けた既存デバイスは presence を返すべき）
        broadcastToRoom(roomId, ws, message);
        return;
      }

      if (currentRoom && rooms.has(currentRoom)) {
        broadcastToRoom(currentRoom, ws, message);
      }
    } catch (e) {
      console.error('Message error', e);
    }
  });

  const broadcastToRoom = (roomId, sender, msg) => {
    const clients = rooms.get(roomId);
    if (!clients) return;
    const data = JSON.stringify(msg);
    clients.forEach(client => {
      if (client !== sender && client.readyState === 1) {
        client.send(data);
      }
    });
  };

  ws.on('close', () => {
    if (currentRoom && rooms.has(currentRoom)) {
      rooms.get(currentRoom).delete(ws);
      if (rooms.get(currentRoom).size === 0) rooms.delete(currentRoom);
    }
  });
});

server.listen(8000, () => {
  console.log('Server started on port 8000');
});
