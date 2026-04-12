import { useSearchStore } from '../store/useSearchStore';

let ws: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let heartbeatTimer: ReturnType<typeof setInterval> | null = null;

const DEVICE_TIMEOUT = 45000; // 45秒でオフライン判定

export const initSync = () => {
  const state = useSearchStore.getState();
  if (!state.enableSync || !state.syncGroupId || !state.syncServerUrl) {
    stopSync();
    return;
  }

  if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) return;

  try {
    ws = new WebSocket(state.syncServerUrl);

    ws.onopen = () => {
      console.log('Sync connected');
      ws?.send(JSON.stringify({ 
        type: 'join', 
        roomId: state.syncGroupId,
        deviceId: state.deviceId,
        deviceName: state.deviceName || getAutoDeviceName()
      }));
      startHeartbeat();
      // 接続時に一度全データをブロードキャストして同期を強制する
      broadcastSync(JSON.parse(state.exportData()));
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        const store = useSearchStore.getState();

        if (message.type === 'sync') {
          const currentData = store.exportData();
          if (JSON.stringify(message.data) !== currentData) {
            console.log('Applying remote sync data');
            store.importData(JSON.stringify(message.data));
          }
        } else if (message.type === 'presence' || message.type === 'join') {
          handlePresence(message);
        }
      } catch (e) { console.error('Sync parse error', e); }
    };

    ws.onclose = () => {
      stopHeartbeat();
      if (useSearchStore.getState().enableSync) {
        if (reconnectTimer) clearTimeout(reconnectTimer);
        reconnectTimer = setTimeout(initSync, 3000);
      }
    };

    ws.onerror = () => ws?.close();
  } catch (e) { console.error('WS Init error', e); }
};

const handlePresence = (msg: any) => {
  const store = useSearchStore.getState();
  if (!msg.deviceId || msg.deviceId === store.deviceId) return;

  const now = Date.now();
  const devices = [...store.connectedDevices];
  const idx = devices.findIndex(d => d.id === msg.deviceId);
  
  if (idx > -1) {
    devices[idx] = { ...devices[idx], name: msg.deviceName, lastSeen: now };
  } else {
    devices.push({ id: msg.deviceId, name: msg.deviceName, lastSeen: now });
    // 新しい人が来たら自分の存在も即座に知らせる（相互認識）
    broadcastPresence();
  }

  store.setConnectedDevices(devices.filter(d => now - d.lastSeen < DEVICE_TIMEOUT));
};

export const broadcastPresence = () => {
  if (ws?.readyState === WebSocket.OPEN) {
    const state = useSearchStore.getState();
    ws.send(JSON.stringify({
      type: 'presence',
      deviceId: state.deviceId,
      deviceName: state.deviceName || getAutoDeviceName()
    }));
  }
};

const startHeartbeat = () => {
  stopHeartbeat();
  heartbeatTimer = setInterval(broadcastPresence, 15000);
};

const stopHeartbeat = () => {
  if (heartbeatTimer) clearInterval(heartbeatTimer);
};

export const stopSync = () => {
  stopHeartbeat();
  if (ws) { ws.close(); ws = null; }
  if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null; }
  useSearchStore.getState().setConnectedDevices([]);
};

export const broadcastSync = (data: any) => {
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'sync', data }));
  }
};

const getAutoDeviceName = () => {
  const ua = navigator.userAgent;
  if (/iPhone/i.test(ua)) return 'iPhone';
  if (/iPad/i.test(ua)) return 'iPad';
  if (/Android/i.test(ua)) return 'Android';
  if (/Mac/i.test(ua)) return 'Mac';
  if (/Win/i.test(ua)) return 'Windows';
  return 'Browser';
};

// ストアの変更を監視して自動同期
let lastDataStr = '';
useSearchStore.subscribe((state) => {
  if (!state.enableSync || !state.syncGroupId) return;
  
  // 変更があった場合のみ文字列化して比較
  const currentData = state.exportData();
  if (currentData !== lastDataStr) {
    lastDataStr = currentData;
    broadcastSync(JSON.parse(currentData));
  }
});
