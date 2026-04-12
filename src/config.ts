const STORAGE_KEY = 'wholphin_settings';

export const getApiBase = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const settings = JSON.parse(saved);
      if (settings.searchServerMode === 'custom' && settings.customSearchServer) {
        return settings.customSearchServer;
      }
    }
  } catch (e) {
    console.error('Failed to get API base from localStorage', e);
  }
  return 'https://api.wholphin.net';
};

export const API_BASE = 'https://api.wholphin.net';
