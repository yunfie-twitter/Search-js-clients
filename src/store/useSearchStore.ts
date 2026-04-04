import { create } from 'zustand';
import { 
  SearchType, 
  ResultMeta, 
  ResultDetail, 
  Pager, 
  createPager,
  getHistory,
  clearHistory,
  removeHistory
} from '@yunfie/search-js';

export type SafeSearchLevel = 'off' | 'moderate' | 'strict';
export type DefaultSearchType = 'web' | 'image' | 'video' | 'news';

interface SearchState {
  query: string;
  type: SearchType;
  results: ResultMeta[];
  isLoading: boolean;
  isInitialLoading: boolean;
  error: string | null;
  pager: Pager | null;
  selectedItem: ResultDetail | null;
  language: 'ja' | 'en';
  themeMode: 'light' | 'dark' | 'system';
  saveHistory: boolean;
  enableAnimations: boolean;
  page: number;

  // 拡充した設定
  resultsPerPage: 10 | 20 | 50;
  defaultSearchType: DefaultSearchType;
  safeSearch: SafeSearchLevel;
  cacheTtl: 0 | 5 | 30 | 60;
  searchRegion: string;
  searchLang: string;

  // Actions
  setQuery: (q: string) => void;
  setType: (t: SearchType) => void;
  setSelectedItem: (item: ResultDetail | null) => void;
  setLanguage: (lang: 'ja' | 'en') => void;
  setThemeMode: (mode: 'light' | 'dark' | 'system') => void;
  setSaveHistory: (save: boolean) => void;
  setEnableAnimations: (enable: boolean) => void;
  setPage: (p: number) => void;
  setResultsPerPage: (n: 10 | 20 | 50) => void;
  setDefaultSearchType: (t: DefaultSearchType) => void;
  setSafeSearch: (level: SafeSearchLevel) => void;
  setCacheTtl: (ttl: 0 | 5 | 30 | 60) => void;
  setSearchRegion: (region: string) => void;
  setSearchLang: (lang: string) => void;

  performSearch: (q: string, type: SearchType, page?: number) => Promise<void>;
  resetSearch: () => void;
}

const STORAGE_KEY = 'wholphin_settings';

const getSavedSettings = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
};

// モジュールスコープにキャッシュを持つことで、saveSetting のたびに
// JSON.parse が走るのを防ぐ
let settingsCache: Record<string, any> = getSavedSettings();

const saveSetting = (key: string, value: any) => {
  settingsCache[key] = value;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settingsCache));
};

const saved = settingsCache;

export const useSearchStore = create<SearchState>((set, get) => ({
  query: '',
  type: 'web',
  results: [],
  isLoading: false,
  isInitialLoading: false,
  error: null,
  pager: null,
  selectedItem: null,
  language: saved.language || 'ja',
  themeMode: saved.themeMode || 'system',
  saveHistory: saved.saveHistory !== undefined ? saved.saveHistory : true,
  enableAnimations: saved.enableAnimations !== undefined ? saved.enableAnimations : true,
  page: 1,

  resultsPerPage: saved.resultsPerPage || 20,
  defaultSearchType: saved.defaultSearchType || 'web',
  safeSearch: saved.safeSearch || 'moderate',
  cacheTtl: saved.cacheTtl !== undefined ? saved.cacheTtl : 5,
  searchRegion: saved.searchRegion || 'JP',
  searchLang: saved.searchLang || 'ja',

  setQuery: (q) => set({ query: q }),
  setType: (t) => set({ type: t }),
  setSelectedItem: (item) => set({ selectedItem: item }),
  setLanguage: (lang) => { set({ language: lang }); saveSetting('language', lang); },
  setThemeMode: (mode) => { set({ themeMode: mode }); saveSetting('themeMode', mode); },
  setSaveHistory: (save) => { set({ saveHistory: save }); saveSetting('saveHistory', save); },
  setEnableAnimations: (enable) => { set({ enableAnimations: enable }); saveSetting('enableAnimations', enable); },
  setPage: (p) => set({ page: p }),
  setResultsPerPage: (n) => { set({ resultsPerPage: n }); saveSetting('resultsPerPage', n); },
  setDefaultSearchType: (t) => { set({ defaultSearchType: t }); saveSetting('defaultSearchType', t); },
  setSafeSearch: (level) => { set({ safeSearch: level }); saveSetting('safeSearch', level); },
  setCacheTtl: (ttl) => { set({ cacheTtl: ttl }); saveSetting('cacheTtl', ttl); },
  setSearchRegion: (region) => { set({ searchRegion: region }); saveSetting('searchRegion', region); },
  setSearchLang: (lang) => { set({ searchLang: lang }); saveSetting('searchLang', lang); },

  performSearch: async (q, type, pageNum = 1) => {
    if (!q) return;
    const { resultsPerPage, safeSearch, searchRegion, searchLang } = get();

    set({ 
      query: q, 
      type: type, 
      page: pageNum,
      isInitialLoading: true, 
      results: [], 
      error: null 
    });

    try {
      // SearchOptions の型定義に存在するフィールドのみ渡す
      // gl / page は SearchOptions にないため除外し、
      // ページ切り替えは元の for ループ方式を維持
      const pager = createPager(
        { q, type, lang: searchLang, safe: safeSearch },
        resultsPerPage
      );
      set({ pager });

      let result = null;
      for (let i = 0; i < pageNum; i++) {
        result = await pager.next();
      }

      const data = result?.data as any;
      const items = Array.isArray(data) ? data : (data?.results || []);

      if (result && result.ok && items.length > 0) {
        set({ results: items, isInitialLoading: false });
      } else {
        set({ results: [], error: result?.error || 'Search failed', isInitialLoading: false });
      }
    } catch (e) {
      set({ results: [], error: 'An unexpected error occurred', isInitialLoading: false });
    }
  },

  resetSearch: () => {
    set({ results: [], pager: null, error: null, isInitialLoading: false, isLoading: false });
  }
}));
