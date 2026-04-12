import { useSearchStore } from '../store/useSearchStore';

let ws = null;
let reconnectTimer = null;
let heartbeatTimer = null;

const DEVICE_TIMEOUT = 30000; // 30秒でオフライン判定

export const initSync = () => {
  const state = useSearchStore.getState();
  if (!state.enableSync || !state.syncGroupId || !state.syncServerUrl) {
    stopSync();
    return;
  }

  if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) return;

  const url = state.syncServerUrl;
  ws = new WebSocket(url);

  ws.onopen = () => {
    console.log('Sync WebSocket connected to', url);
    // 参加時にデバイス情報を送信
    ws.send(JSON.stringify({ 
      type: 'join', 
      roomId: state.syncGroupId,
      deviceId: state.deviceId,
      deviceName: state.deviceName || getAutoDeviceName()
    }));
    startHeartbeat();
  };

  ws.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data);
      const store = useSearchStore.getState();

      if (message.type === 'sync') {
        const currentData = store.exportData();
        if (JSON.stringify(message.data) !== currentData) {
          store.importData(JSON.stringify(message.data));
        }
      } else if (message.type === 'presence' || message.type === 'joined') {
        // デバイスの存在通知を受信
        updateDeviceList(message);
      }
    } catch (e) {
      console.error('Failed to process sync message', e);
    }
  };

  ws.onclose = () => {
    console.log('Sync WebSocket closed');
    stopHeartbeat();
    if (useSearchStore.getState().enableSync) {
      if (reconnectTimer) clearTimeout(reconnectTimer);
      reconnectTimer = setTimeout(initSync, 5000);
    }
  };

  ws.onerror = (err) => {
    console.error('Sync WebSocket error', err);
    ws.close();
  };
};

const updateDeviceList = (msg) => {
  const store = useSearchStore.getState();
  const now = Date.now();
  
  if (!msg.deviceId || msg.deviceId === store.deviceId) return;

  const newDevices = [...store.connectedDevices];
  const idx = newDevices.findIndex(d => d.id === msg.deviceId);
  
  if (idx > -1) {
    newDevices[idx] = { ...newDevices[idx], name: msg.deviceName, lastSeen: now };
  } else {
    newDevices.push({ id: msg.deviceId, name: msg.deviceName, lastSeen: now });
  }

  // 古いデバイスを削除
  const activeDevices = newDevices.filter(d => now - d.lastSeen < DEVICE_TIMEOUT);
  store.setConnectedDevices(activeDevices);

  // 自分の存在も定期的にブロードキャスト（相手が新しく入ってきた時のため）
  if (msg.type === 'join') {
    broadcastPresence();
  }
};

const broadcastPresence = () => {
  if (ws && ws.readyState === WebSocket.OPEN) {
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
  heartbeatTimer = setInterval(broadcastPresence, 10000); // 10秒おき
};

const stopHeartbeat = () => {
  if (heartbeatTimer) clearInterval(heartbeatTimer);
};

export const stopSync = () => {
  stopHeartbeat();
  if (ws) {
    ws.close();
    ws = null;
  }
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  useSearchStore.getState().setConnectedDevices([]);
};

export const broadcastSync = (data) => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'sync', data }));
  }
};

const getAutoDeviceName = () => {
  const ua = navigator.userAgent;
  if (/iPhone/i.test(ua)) return 'iPhone';
  if (/iPad/i.test(ua)) return 'iPad';
  if (/Android/i.test(ua)) return 'Android Device';
  if (/Mac/i.test(ua)) return 'Mac';
  if (/Win/i.test(ua)) return 'Windows PC';
  return 'Web Device';
};

// ストアの変更を監視して自動ブロードキャスト
let lastBroadcastTime = 0;
useSearchStore.subscribe((state, prevState) => {
  if (!state.enableSync || !state.syncGroupId) return;

  const now = Date.now();
  if (now - lastBroadcastTime < 1500) return; // 少し長めのデバウンス

  const data = JSON.parse(state.exportData());
  const prevData = JSON.parse(prevState.exportData());

  if (JSON.stringify(data) !== JSON.stringify(prevData)) {
    lastBroadcastTime = now;
    broadcastSync(data);
  }
});
