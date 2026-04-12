import { useSearchStore } from '../store/useSearchStore';

let ws: WebSocket | null = null;
let reconnectTimer: any = null;
let heartbeatTimer: any = null;
// 他デバイスからの sync を import 中は自分から再ブロードキャストしない（ループ防止）
let isReceiving = false;

export const initSync = () => {
  const state = useSearchStore.getState();
  if (!state.enableSync || !state.syncGroupId || !state.syncServerUrl) {
    stopSync();
    return;
  }

  if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) return;

  try {
    console.log('Attempting to connect sync server:', state.syncServerUrl);
    ws = new WebSocket(state.syncServerUrl);

    ws.onopen = () => {
      console.log('Sync connected');
      const s = useSearchStore.getState();
      ws?.send(JSON.stringify({
        type: 'join',
        roomId: s.syncGroupId,
        deviceId: s.deviceId,
        deviceName: s.deviceName || getAutoDeviceName(),
        role: s.deviceRole
      }));
      startHeartbeat();
      if (s.deviceRole === 'owner') {
        broadcastSync(JSON.parse(s.exportData()));
      }
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        if (message.type === 'ping') {
          ws?.send(JSON.stringify({ type: 'pong' }));
          return;
        }

        if (message.messageId) {
          ws?.send(JSON.stringify({ type: 'ack', messageId: message.messageId }));
        }

        const store = useSearchStore.getState();
        if (message.type === 'sync') {
          isReceiving = true;
          try {
            store.importData(JSON.stringify(message.data));
          } finally {
            isReceiving = false;
          }
        } else if (
          message.type === 'presence' ||
          message.type === 'join' ||
          message.type === 'presence_reply'
        ) {
          handlePresence(message);
        }
      } catch (e) { console.error('Sync parse error', e); }
    };

    ws.onclose = () => {
      console.log('Sync disconnected');
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
  if (msg.deviceId === store.deviceId && msg.type !== 'presence_reply') {
    store.regenerateDeviceId();
    broadcastPresence();
    return;
  }
  if (!msg.deviceId || msg.deviceId === store.deviceId) return;
  const now = Date.now();
  const devices = [...store.connectedDevices];
  const idx = devices.findIndex(d => d.id === msg.deviceId);
  if (idx > -1) {
    devices[idx] = { ...devices[idx], name: msg.deviceName, lastSeen: now, role: msg.role };
  } else {
    devices.push({ id: msg.deviceId, name: msg.deviceName, lastSeen: now, role: msg.role });
    if (msg.type === 'join' || msg.type === 'presence') sendDirectPresence('presence_reply');
  }
  store.setConnectedDevices(devices);
};

const sendDirectPresence = (type: string = 'presence') => {
  if (ws?.readyState === WebSocket.OPEN) {
    const s = useSearchStore.getState();
    ws.send(JSON.stringify({
      type,
      deviceId: s.deviceId,
      deviceName: s.deviceName || getAutoDeviceName(),
      role: s.deviceRole
    }));
  }
};

export const broadcastPresence = () => sendDirectPresence('presence');

const startHeartbeat = () => {
  stopHeartbeat();
  heartbeatTimer = setInterval(broadcastPresence, 15000);
};

const stopHeartbeat = () => { if (heartbeatTimer) clearInterval(heartbeatTimer); };

export const stopSync = () => {
  stopHeartbeat();
  if (ws) {
    console.log('Stopping sync connection');
    ws.close();
    ws = null;
  }
  if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null; }
};

export const broadcastSync = (data: any) => {
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'sync', data }));
  }
};

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
let lastHistoryVersion = -1;
let lastSyncState = false;

useSearchStore.subscribe((state) => {
  // 同期スイッチの切り替え検知
  if (state.enableSync !== lastSyncState) {
    lastSyncState = state.enableSync;
    if (state.enableSync) initSync();
    else stopSync();
  }

  if (!state.enableSync || !state.syncGroupId) return;
  // 受信中は再ブロードキャストしない
  if (isReceiving) return;

  const currentData = state.exportData();
  // 設定変化 OR 履歴変化(橋渡しは exportData に含まれるが historyVersion で確実に検知)
  const settingsChanged = currentData !== lastDataStr;
  const historyChanged = state.historyVersion !== lastHistoryVersion;

  if (settingsChanged || historyChanged) {
    lastDataStr = currentData;
    lastHistoryVersion = state.historyVersion;
    broadcastSync(JSON.parse(currentData));
  }
});
