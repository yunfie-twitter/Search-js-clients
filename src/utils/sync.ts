import { useSearchStore } from '../store/useSearchStore';

let ws: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let heartbeatTimer: ReturnType<typeof setInterval> | null = null;

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
        deviceName: state.deviceName || getAutoDeviceName(),
        role: state.deviceRole
      }));
      startHeartbeat();
      broadcastSync(JSON.parse(state.exportData()));
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        const store = useSearchStore.getState();

        if (message.type === 'sync') {
          store.importData(JSON.stringify(message.data));
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
  
  // ID衝突検知: 自分と同じIDを使っている他端末がいれば、自分側を再生成する
  if (msg.deviceId === store.deviceId && msg.type !== 'joined_ack') {
    console.warn('Device ID collision detected. Regenerating identity...');
    store.regenerateDeviceId();
    broadcastPresence();
    return;
  }

  if (!msg.deviceId || msg.deviceId === store.deviceId) return;

  const now = Date.now();
  const devices = [...store.connectedDevices];
  const idx = devices.findIndex(d => d.id === msg.deviceId);
  
  if (idx > -1) {
    devices[idx] = { ...devices[idx], name: msg.deviceName, lastSeen: now };
  } else {
    devices.push({ id: msg.deviceId, name: msg.deviceName, lastSeen: now });
    broadcastPresence();
  }

  store.setConnectedDevices(devices);
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
  // デバイスリストは保持したままにする（オフライン表示のため）
};

export const broadcastSync = (data: any) => {
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'sync', data }));
  }
};

// ストアからアクセス可能にする
(window as any)._syncUtils = { broadcastSync, exportData: () => useSearchStore.getState().exportData() };

const getAutoDeviceName = () => {
  const ua = navigator.userAgent;
  if (/iPhone/i.test(ua)) return 'iPhone';
  if (/iPad/i.test(ua)) return 'iPad';
  if (/Android/i.test(ua)) return 'Android';
  if (/Mac/i.test(ua)) return 'Mac';
  if (/Win/i.test(ua)) return 'Windows';
  return 'Browser';
};

let lastDataStr = '';
useSearchStore.subscribe((state) => {
  if (!state.enableSync || !state.syncGroupId) return;
  
  const currentData = state.exportData();
  if (currentData !== lastDataStr) {
    lastDataStr = currentData;
    broadcastSync(JSON.parse(currentData));
  }
});
